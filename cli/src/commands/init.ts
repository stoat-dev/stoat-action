import { Command } from 'commander';

import initHelpers from '../lib/init/action';

export const init = new Command('init').description('initialize Stoat in current repository').action(initHelpers);
