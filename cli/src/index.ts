#!/usr/bin/env node
import { init } from './commands/init';
import { local } from './commands/local';
import versionWarningBanner from './helpers/versionWarningBanner';
import { version } from './version.json';

const commander = require('commander');

const description = `Stoat is a tool that helps developers view and aggregate build data.
This CLI is designed to help users work with config files and provide local previews of Stoat's functionality.
Please visit https://stoat.dev/ for more information.`;

(async () => {
  await versionWarningBanner();

  commander.version(version).description(description).addCommand(init).addCommand(local).parse(process.argv);

  if (!process.argv.slice(2).length) {
    commander.outputHelp();
  }
})();

export {};
