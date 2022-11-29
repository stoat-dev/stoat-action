import * as core from '@actions/core';
import fs from 'fs';

import { StaticHostingTask } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { createSignedUrl, submitPartialConfig, uploadDirectory } from './helpers';

const runStaticHostingPlugin = async (
  taskId: string,
  taskConfig: StaticHostingTask,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${taskId}] Current directory: ${process.cwd()}`);

  const pathToUpload = taskConfig.static_hosting.path;
  if (!fs.existsSync(pathToUpload)) {
    core.warning(`[${taskId}] Path to upload does not exist; it may be built in a different action: ${pathToUpload}`);
    return;
  }

  // get signed url
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId: taskId
  });

  // upload directory
  core.info(`[${taskId}] Uploading ${pathToUpload} to ${objectPath}...`);
  await uploadDirectory(signedUrl, fields, pathToUpload, objectPath);

  // submit partial config
  await submitPartialConfig(taskId, ghSha, ghToken, hostingUrl, stoatConfigFileId);
};

export default runStaticHostingPlugin;
