import { deepmerge } from 'deepmerge-ts';
import express from 'express';
import fs from 'fs';
import Handlebars from 'handlebars';
import http from 'http';
import { marked } from 'marked';
import { AddressInfo } from 'net';
import path from 'path';
import portfinder from 'portfinder';

import { StaticHostingPlugin } from '../../../../src/schemas/stoatConfigSchema';
import { getGitRoot } from '../pathHelpers';
import ConfigFileGlobal from './configFileGlobal';

// map from taskId to static hosting path to the server object
const staticServers: { [key: string]: { [key: string]: http.Server } } = {};

const tableHbs: string =
  '| Name | Link | Commit | Status |\n' +
  '| :--- | :--- | :--: | :-----: |\n' +
  '{{#each tasks}}\n' +
  '{{#if this.static_hosting.status ~}}\n' +
  '| **{{#if this.metadata.name}}{{{ this.metadata.name }}}{{else}}{{ @key }}{{/if}}** | [Visit]({{ this.static_hosting.link }}) | {{ this.static_hosting.sha }} | {{{ this.static_hosting.status }}} |\n' +
  '{{/if ~}}\n' +
  '{{/each}}';

async function createServer(localPath: string): Promise<http.Server> {
  const port = await portfinder.getPortPromise();
  const expressApp = express();
  expressApp.use(express.static(localPath));
  return expressApp.listen(port);
}

export async function getDashboard(req: express.Request, res: express.Response) {
  try {
    const schema = ConfigFileGlobal.getSchema();
    const template = ConfigFileGlobal.getTemplate();

    if (schema === undefined) {
      throw new Error('Unable to read Stoat config file!');
    }

    if (template === undefined) {
      throw new Error('Unable to read Stoat template!');
    }

    let links = {};

    if (schema.tasks !== undefined) {
      const staticHostingTaskIds = new Set();

      for (const taskId in schema.tasks) {
        const task = schema.tasks[taskId];
        if ('static_hosting' in schema.tasks[taskId]) {
          staticHostingTaskIds.add(taskId);

          const hostingTask = task as StaticHostingPlugin;
          const localPath = hostingTask.static_hosting.path;

          const absolutePath = path.join(getGitRoot(), localPath);
          const indexPath = path.join(absolutePath, 'index.html');

          if (fs.existsSync(indexPath)) {
            // manage static server lifecycle
            if (taskId in staticServers) {
              if (localPath in staticServers[taskId]) {
                // do nothing, server is already running for the right path
              } else {
                // destroy server and start new one
                staticServers[taskId][localPath].close();
                staticServers[taskId][localPath] = await createServer(absolutePath);
              }
            } else {
              // create server from scratch
              staticServers[taskId] = { [localPath]: await createServer(absolutePath) };
            }

            // add to links config
            const port = (staticServers[taskId][localPath].address() as AddressInfo).port;

            links = deepmerge(links, {
              tasks: {
                [taskId]: {
                  static_hosting: {
                    sha: 'unknown',
                    link: `http://localhost:${port}/`,
                    status: '✅'
                  }
                }
              }
            });
          }
        }
      }

      // destroy all servers that no longer exist in the config
      Object.keys(staticServers)
        .filter((x) => !staticHostingTaskIds.has(x))
        .forEach((taskId) => {
          Object.values(staticServers[taskId]).forEach((server) => server.close());
          delete staticServers[taskId];
        });
    }

    const partialMerged = deepmerge(schema, links);

    const tableTemplate = Handlebars.compile(tableHbs);
    const tableMd = tableTemplate(partialMerged);

    const merged = deepmerge(partialMerged, {
      views: {
        plugins: {
          static_hosting: {
            github: {
              table: tableMd
            }
          }
        }
      }
    });

    const stoatTemplate = Handlebars.compile(template.template);
    const renderedMd = stoatTemplate(merged);
    const html = marked.parse(renderedMd);

    res.send({ html: html });
  } catch (e: any) {
    res.status(500).send({ html: `<strong>Error:</strong><br><pre><code>${e}</code></pre>` });
  }
}
