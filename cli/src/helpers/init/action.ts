import chalk from 'chalk';

import { getGitRoot } from '../pathHelpers';
import { createConfigFile } from './configFileHelpers';
import { promptAddingStoatActions } from './stoatActionHelpers';

const exitMessage = `
---
Stoat init completed!
Remember to install the GitHub application on your repo: https://github.com/apps/stoat-app/
If you have any other questions, please consult our docs: https://docs.stoat.dev/
`.trim();

export default async () => {
  getGitRoot('Stoat initialization must be run from inside a Git repository!');
  createConfigFile();
  await promptAddingStoatActions();
  console.log(chalk.green(exitMessage));
};
// a
