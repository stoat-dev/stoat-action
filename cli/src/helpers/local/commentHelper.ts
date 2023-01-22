import cors from 'cors';
import { deepmerge } from 'deepmerge-ts';
import express from 'express';
import fs from 'fs';
import Handlebars from 'handlebars';
import http from 'http';
import { marked } from 'marked';
import { AddressInfo } from 'net';
import path from 'path';
import portfinder from 'portfinder';

import { StaticHostingPlugin } from '../../../../types/src/schemas/stoatConfigSchema';
import { getGitRoot } from '../pathHelpers';
import ConfigFileGlobal from './configFileGlobal';

// map from taskId to static hosting path to the server object
const staticServers: { [key: string]: { [key: string]: http.Server } } = {};

const tableHbs: string =
  '| Name | Link | Commit | Status |\n' +
  '| :--- | :--- | :--: | :-----: |\n' +
  '{{#each plugins.static_hosting }}\n' +
  '{{#if this.status ~}}\n' +
  '| **{{#if this.metadata.name}}{{{ this.metadata.name }}}{{else}}{{ @key }}{{/if}}** | [Visit]({{ this.link }}) | {{ this.sha }} | {{{ this.status }}} |\n' +
  '{{/if ~}}\n' +
  '{{/each}}';

async function createServer(localPath: string): Promise<http.Server> {
  console.log(`Creating server for: ${localPath}`);
  const port = await portfinder.getPortPromise();
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.static(localPath));
  return expressApp.listen(port);
}

async function runServersAndGetLinkUpdate(
  staticServers: { [key: string]: { [key: string]: http.Server } },
  taskId: string,
  localPath: string,
  directoryToHost: string,
  portToLink: (port: number) => string
) {
  if (taskId in staticServers) {
    if (localPath in staticServers[taskId]) {
      // do nothing, server is already running for the right path
    } else {
      // destroy server and start new one
      staticServers[taskId][localPath].close();
      staticServers[taskId][localPath] = await createServer(directoryToHost);
    }
  } else {
    // create server from scratch
    staticServers[taskId] = { [localPath]: await createServer(directoryToHost) };
  }

  // add to links config
  const port = (staticServers[taskId][localPath].address() as AddressInfo).port;

  return {
    plugins: {
      static_hosting: {
        [taskId]: {
          sha: 'local',
          link: portToLink(port),
          status: '✅'
        }
      }
    }
  };
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

    if (schema.plugins?.static_hosting !== undefined) {
      const staticHostingTaskIds = new Set();

      for (const taskId in schema.plugins?.static_hosting) {
        staticHostingTaskIds.add(taskId);

        const task = schema.plugins.static_hosting[taskId] as StaticHostingPlugin;
        const localPath = task.path;
        const absolutePath = path.join(getGitRoot(), localPath);

        let linkUpdate;

        if ('file_viewer' in task && task.file_viewer) {
          linkUpdate = await runServersAndGetLinkUpdate(
            staticServers,
            taskId,
            localPath,
            absolutePath,
            (port) => `https://www.stoat.dev/file-viewer?root=http://localhost:${port}/`
          );
        } else if (fs.existsSync(absolutePath)) {
          const indexPath = path.join(absolutePath, 'index.html');
          if (fs.lstatSync(absolutePath).isFile()) {
            linkUpdate = await runServersAndGetLinkUpdate(
              staticServers,
              taskId,
              localPath,
              path.dirname(absolutePath),
              (port) => `http://localhost:${port}/${path.basename(absolutePath)}`
            );
          } else if (fs.existsSync(indexPath)) {
            linkUpdate = await runServersAndGetLinkUpdate(
              staticServers,
              taskId,
              localPath,
              absolutePath,
              (port) => `http://localhost:${port}/}`
            );
          }
        }

        if (linkUpdate) {
          links = deepmerge(links, linkUpdate);
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
