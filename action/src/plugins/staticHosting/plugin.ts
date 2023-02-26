import * as core from '@actions/core';
import fs from 'fs';
import { resolve } from 'path';

import { StaticHostingPlugin } from '../../../../types/src';
import { GithubActionRun } from '../../types';
import { processPath } from './helpers';

const runStaticHostingPlugin = async (
  taskId: string,
  taskConfig: StaticHostingPlugin,
  {
    ghToken,
    ghRepository: { repo, owner },
    ghBranch,
    ghPullRequestNumber,
    ghSha,
    ghRunMatrix,
    stepsSucceeded
  }: GithubActionRun,
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

  await processPath(
    taskId,
    taskConfig,
    {
      ghRepository: { owner, repo },
      ghBranch,
      ghPullRequestNumber,
      ghSha,
      ghRunMatrix,
      ghToken,
      stepsSucceeded
    },
    stoatConfigFileId,
    pathToUpload
  );
};

export default runStaticHostingPlugin;
