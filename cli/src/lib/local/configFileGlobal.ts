import fs from 'fs';

import { getTypedStoatConfig, readStoatConfig } from '../../../../src/configHelpers';
import { StoatConfigSchema } from '../../../../src/schemas/stoatConfigSchema';
import { getTemplate } from '../../../../src/templateHelpers';
import { Template } from '../../../../src/types';
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
    try {
      await ConfigFileGlobal.update();
    } catch (e) {
      // do nothing
    }

    fs.watch(findStoatConfigPath(process.cwd()), async (eventType, filename) => {
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
