import chalk from 'chalk';
import fs from 'fs';
import { getTypedStoatConfig, readStoatConfig } from '../../../../action/src/configHelpers';
import {StoatConfigSchema} from "../../../../action/src/schemas/stoatConfigSchema";
import { getTemplate } from '../../../../action/src/templateHelpers';
import { Template } from '../../../../action/src/types';

import { findStoatConfigPath } from '../pathHelpers';

export default class ConfigFileGlobal {
  private static schema: StoatConfigSchema | undefined;
  private static template: Template | undefined;

  static async update() {
    const configFilePath = findStoatConfigPath(process.cwd());
    const stoatConfig = readStoatConfig(configFilePath);
    this.schema = await getTypedStoatConfig(stoatConfig);
    this.template = await getTemplate('', '', this.schema);
  }

  static getSchema() {
    return this.schema;
  }

  static getTemplate() {
    return this.template;
  }

  static async initialize() {
    const configPath = findStoatConfigPath(process.cwd());

    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Stoat config file does not exist for this repo. Try running: stoat init'));
      process.exit(1);
    }

    try {
      await ConfigFileGlobal.update();
    } catch (e) {
      // do nothing
    }

    fs.watch(configPath, async (eventType, filename) => {
      if (eventType === 'change') {
        try {
          await ConfigFileGlobal.update();
        } catch (e) {
          // do nothing
        }
      }
    });
  }
}
