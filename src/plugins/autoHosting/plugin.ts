import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fs from 'fs';
import { resolve } from 'path';

import { AutoHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { processDirectory } from '../../uploading';

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

export const getValidDirectories = (inputDirectories: string[]): string[] => {
  return inputDirectories.filter(async (dir) => {
    const dirPath = resolve(dir);
    const dirStats = await fs.promises.stat(dirPath);
    return dirStats.isDirectory();
  });
};

export const getSubtaskId = (directory: string): string => {
  const subtaskId = directory.replace(/^\.\//g, '').replace(/\//g, '-');
  return subtaskId === '' ? '-' : subtaskId;
};

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
  if (exitCode !== 0) {
    core.error(`[${taskId}] Failed to search for index.html files (exit code ${exitCode}): ${stderr}`);
    return;
  }

  const allDirectories = stdout.split('\n');
  core.info(
    `[${taskId}] Found ${allDirectories.length} directories with index.html files:\n-- ${allDirectories.join('\n--')}`
  );
  const rootDirectories = getRootDirectories(allDirectories);
  core.info(`[${taskId}] Candidate directories:\n-- ${rootDirectories.join('\n-- ')}`);

  const validDirectories = getValidDirectories(rootDirectories);

  for (const directory of validDirectories) {
    await processDirectory(owner, repo, ghSha, ghToken, stoatConfigFileId, getSubtaskId(directory), directory);
  }
};

export default runAutoHostingPlugin;
