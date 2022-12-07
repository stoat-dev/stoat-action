import { Command } from 'commander';

import initHelpers from '../helpers/init/action';

export const init = new Command('init').description('initialize Stoat in current repository').action(initHelpers);
