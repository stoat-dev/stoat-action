import { Command } from 'commander';

import localAction from '../lib/local/action';
import { DEFAULT_PORT } from '../lib/local/portHelper';

export const local = new Command('local')
  .description('preview the Stoat comment for the repository locally')
  .option(
    '-p, --port <port>',
    `port for the local server (default is any available port starting with ${DEFAULT_PORT})`
  )
  .action(localAction);
