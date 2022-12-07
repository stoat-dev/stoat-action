import chalk from 'chalk';
import express from 'express';

import { getGitRoot } from '../pathHelpers';
import { getDashboard } from './commentHelper';
import ConfigFileGlobal from './configFileGlobal';
import { getPort } from './portHelper';

const open = require('open');

const app = express();

export default async (options: any) => {
  getGitRoot('Stoat local previews must be run from inside a Git repository!');

  await ConfigFileGlobal.initialize();

  const port = await getPort(options.port);

  app.use(express.static(`${__dirname}/../public`));
  app.get('/dashboard', getDashboard);

  app.listen(port, () => {
    console.log(chalk.green(`Local preview server started at http://localhost:${port}`));
  });

  await open(`http://localhost:${port}`);
  console.log(chalk.green('Opened Stoat local page in browser...'));
  console.log(chalk.green('Type Control+C to close server...'));
};
