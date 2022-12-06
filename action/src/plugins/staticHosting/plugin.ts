import * as core from '@actions/core';
import fs from 'fs';
import { resolve } from 'path';

import { StaticHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun, UploadStaticHostingRequest } from '../../types';
import { submitPartialConfig } from '../helpers';
import { createSignedUrl, uploadDirectory } from './helpers';

const runStaticHostingPlugin = async (
  taskId: string,
  taskConfig: StaticHostingPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);
  const currentDirectory = process.cwd();
  core.info(`[${taskId}] Current directory: ${currentDirectory}`);

  const pathToUpload = resolve(taskConfig.static_hosting.path);
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
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId
  });

  // upload directory
  core.info(`[${taskId}] Uploading ${pathToUpload} to ${objectPath}...`);
  await uploadDirectory(signedUrl, fields, pathToUpload, objectPath);

  // submit partial config
  const requestBody: UploadStaticHostingRequest = {
    ghSha,
    taskId,
    stoatConfigFileId,
    ghToken,
    hostingUrl
  };
  await submitPartialConfig<UploadStaticHostingRequest>(taskId, 'static_hostings', requestBody);
};

export default runStaticHostingPlugin;
