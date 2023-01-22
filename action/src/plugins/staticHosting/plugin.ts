import * as core from '@actions/core';
import fs from 'fs';
import { basename, resolve } from 'path';

import { StaticHostingPlugin, StaticHostingPluginRendered, UploadGenericPartialConfigRequest } from '../../../../types';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from '../helpers';
import { createSignedUrl, uploadPath } from './helpers';

const runStaticHostingPlugin = async (
  taskId: string,
  taskConfig: StaticHostingPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha, stepsSucceeded }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);
  const currentDirectory = process.cwd();
  core.info(`[${taskId}] Current directory: ${currentDirectory}`);

  const pathToUpload = resolve(taskConfig.path);
  core.info(`[${taskId}] Path to upload: ${pathToUpload}`);

  if (!fs.existsSync(pathToUpload)) {
    core.warning(`[${taskId}] Path to upload does not exist; it may be built in a different action.`);
    return;
  }
  if (pathToUpload === currentDirectory) {
    core.error(`[${taskId}] For security reason, the project root directory cannot be uploaded for hosting.`);
    return;
  }

  // get signed url
  const isFile = fs.lstatSync(pathToUpload).isFile();
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    filename: isFile ? basename(pathToUpload) : undefined
  });

  // upload directory
  core.info(`[${taskId}] Uploading ${pathToUpload} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, pathToUpload, objectPath);

  // submit partial config
  const renderedPlugin: StaticHostingPluginRendered = {
    ...taskConfig,
    sha: ghSha,
    link: taskConfig.file_viewer ? `https://www.stoat.dev/file-viewer?root=${hostingUrl}` : hostingUrl,
    status: stepsSucceeded ? '✅' : '❌'
  };
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    partialConfig: {
      plugins: {
        static_hosting: { [taskId]: renderedPlugin }
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
};

export default runStaticHostingPlugin;
