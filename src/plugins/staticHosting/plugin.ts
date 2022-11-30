import * as core from '@actions/core';
import fs from 'fs';

import { StaticHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { processDirectory } from '../../uploading';

const runStaticHostingPlugin = async (
  taskId: string,
  taskConfig: StaticHostingPlugin,
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

  await processDirectory(owner, repo, ghSha, ghToken, stoatConfigFileId, taskId, pathToUpload);
};

export default runStaticHostingPlugin;
