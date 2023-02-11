import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fs from 'fs';
import { resolve } from 'path';

import { AutoHostingPlugin, StaticHostingPlugin } from '../../../../types/src';
import { GithubActionRun } from '../../types';
import { processPath } from '../staticHosting/helpers';

/**
 * For a list of directories, remove subdirectories and return the root directories.
 * For example, directories ["./docs/build", "./docs/build/docs", "./docs/build/blog"]
 * will be reduced to ["./docs/build"].
 */
export const getRootDirectories = (inputDirectories: string[]): string[] => {
  const sortedDirectories = inputDirectories.filter((d) => d.trim() !== '').sort((d1, d2) => d1.localeCompare(d2));
  const rootDirectories: string[] = [];
  for (const directory of sortedDirectories) {
    const isSubdirectory = rootDirectories.some((rootDirectory) => directory.startsWith(rootDirectory));
    if (!isSubdirectory) {
      rootDirectories.push(directory);
    }
  }
  return rootDirectories.sort((d1, d2) => d1.localeCompare(d2));
};

/**
 * Some paths returned by the find command may not be valid directories to upload.
 * This function filters out those invalid paths.
 */
export const getValidDirectories = (inputDirectories: string[]): string[] => {
  return inputDirectories.filter(async (dir) => {
    const dirPath = resolve(dir);
    const dirStats = await fs.promises.stat(dirPath);
    return dirStats.isDirectory();
  });
};

/**
 * The auto hosting plugin generates multiple partial configs for a single task.
 * To reuse the logic of static hosting plugin, a subtask id is auto generated
 * from each of directories to upload as the pseudo task id of the partial config.
 */
export const getSubtaskId = (directory: string): string => {
  const subtaskId = directory.replace(/^\.\//g, '').replace(/\//g, '-');
  return subtaskId === '' ? '-' : subtaskId;
};

const runAutoHostingPlugin = async (
  taskId: string,
  taskConfig: AutoHostingPlugin,
  { ghToken, ghRepository: { repo, owner }, ghBranch, ghPullRequestNumber, ghSha, stepsSucceeded }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running auto hosting plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${taskId}] Current directory: ${process.cwd()}`);

  const { exitCode, stdout, stderr } = await exec.getExecOutput('/bin/sh', [
    '-c',
    "find . ! -path '*/node_modules/*' -type f -name 'index.html' | sed -r 's|/[^/]+$||' | sort | uniq"
  ]);
  if (exitCode !== 0) {
    core.error(`[${taskId}] Failed to search for index.html files (exit code ${exitCode}): ${stderr}`);
    return;
  }

  const allDirectories = stdout.split('\n').filter((d) => d.trim() !== '');
  core.debug(
    `[${taskId}] Found ${allDirectories.length} directories with index.html files:\n-- ${allDirectories.join('\n--')}`
  );
  const rootDirectories = getRootDirectories(allDirectories);
  core.info(`[${taskId}] Candidate directories:\n-- ${rootDirectories.join('\n-- ')}`);

  const validDirectories = getValidDirectories(rootDirectories);

  for (const directory of validDirectories) {
    const staticHostingTaskConfig: StaticHostingPlugin = {
      metadata: {
        name: `Path \`${directory}\``
      },
      path: directory
    };
    await processPath(
      getSubtaskId(directory),
      staticHostingTaskConfig,
      {
        ghRepository: { owner, repo },
        ghBranch,
        ghPullRequestNumber,
        ghSha,
        ghToken,
        stepsSucceeded
      },
      stoatConfigFileId,
      directory
    );
  }
};

export default runAutoHostingPlugin;
