import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export const findGitRoot = (currentDir: string): string => {
  if (fs.existsSync(path.join(currentDir, '.git'))) {
    return currentDir;
  }

  const { dir } = path.parse(currentDir);

  if (dir === currentDir) {
    throw new Error('Could not find the root of the Git repository');
  }

  return findGitRoot(dir);
};

// works in the root Git dir or subdirectories, doesn't need the file to exist
export const findStoatConfigPath = (currentDir: string): string => {
  const gitRoot = findGitRoot(currentDir);
  return path.join(gitRoot, '.stoat/config.yaml');
};

export function getGitRoot(errorMessage: string = 'This was expected to run from inside a Git repository!') {
  try {
    return findGitRoot(process.cwd());
  } catch (e) {
    console.error(chalk.red(errorMessage));
    process.exit(1);
  }
}
