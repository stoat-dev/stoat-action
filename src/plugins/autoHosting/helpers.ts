import * as core from '@actions/core';
import fs from 'fs';
import { resolve } from 'path';

/**
 * Prune input directories to filter subdirectories that share the same root directory.
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

export const getValidDirectories = (inputDirectories: string[]): string[] => {
  return inputDirectories.filter(async (dir) => {
    const dirPath = resolve(dir);
    const dirStats = await fs.promises.stat(dirPath);
    return dirStats.isDirectory();
  });
};
