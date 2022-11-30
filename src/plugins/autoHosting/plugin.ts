import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { AutoHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { getRootDirectories } from './helpers';

const runAutoHostingPlugin = async (
  taskId: string,
  taskConfig: AutoHostingPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running auto hosting plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${taskId}] Current directory: ${process.cwd()}`);

  const { exitCode, stdout, stderr } = await exec.getExecOutput('/bin/sh', [
    '-c',
    "find . ! -path '*/node_modules/*' -type f -name 'index.html' | sed -r 's|/[^/]+$||' | sort | uniq"
  ]);
  const allDirectories = stdout.split('\n');
  core.info(
    `[${taskId}] Found ${allDirectories.length} directories with index.html files:\n-- ${allDirectories.join('\n--')}`
  );
  const directoriesToUpload = getRootDirectories(allDirectories);
  core.info(`[${taskId}] Directories to upload:\n-- ${directoriesToUpload.join('\n-- ')}`);
};

export default runAutoHostingPlugin;
