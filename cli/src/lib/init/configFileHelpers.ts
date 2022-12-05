import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

import { findStoatConfigPath, gitRoot } from '../pathHelpers';

const defaultStoatConfigFile =
  `
---
version: 1
enabled: true
#tasks:
#  your-unique-identifier:
#    metadata:
#      name: "Name of artifact you're hosting, such as Code Coverage Report"
#    static_hosting:
#      path: path/from/git/root/to/directory/to/host
#  docs:
#    metadata:
#      name: Documentation
#    static_hosting:
#      path: docs/build
`.trim() + '\n';

export function createConfigFile() {
  const configFilePath = findStoatConfigPath(process.cwd());

  if (fs.existsSync(configFilePath)) {
    console.warn(chalk.yellow(`Stoat config file already exists: ${configFilePath}`));
  } else {
    const stoatDirectory = path.join(gitRoot, '.stoat');
    if (!fs.existsSync(stoatDirectory)) {
      fs.mkdirSync(stoatDirectory);
    }

    fs.writeFileSync(configFilePath, defaultStoatConfigFile);
    console.log(`Stoat config file created at: ${configFilePath}`);
  }
}
