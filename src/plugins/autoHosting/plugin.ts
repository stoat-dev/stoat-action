import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { AutoHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';

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
  core.info(`[${taskId}] Candidate directories: ${exitCode}, ${stdout}, ${stderr}`);
};

export default runAutoHostingPlugin;
