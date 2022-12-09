import * as core from '@actions/core';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';

import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import stoatSchema from './schemas/stoatConfigSchema.json';

const ajv = new Ajv();

export function readStoatConfig(configFilePath: string = '.stoat/config.yaml'): any {
  const stoatConfigFileBuffer = readFileSync(configFilePath);
  return yaml.load(stoatConfigFileBuffer.toString()) as any;
}

export async function getTypedStoatConfig(stoatConfig: any): Promise<StoatConfigSchema> {
  core.info(`Validating Stoat config file: ${JSON.stringify(stoatConfig)}`);
  const validate = ajv.compile(stoatSchema);
  const valid = validate(stoatConfig);

  if (!valid) {
    core.error((validate.errors ?? []).map((e) => e.message).join('; '));
    throw new Error('Failed to validate Stoat config file!');
  }

  return processNullPluginConfig(stoatConfig as StoatConfigSchema);
}

/**
 * This function updates the config in place. If any of the plugin configs
 * are null, this function replaces the null value with an empty object.
 * This is necessary because when any plugin config is null, the deepmerge
 * on the server side will replace the null value with the last object value
 * without merging multiple objects.
 * In the future, we can use a custom merging function to fix this issue
 * on the server side.
 */
export const processNullPluginConfig = (stoatConfig: StoatConfigSchema): StoatConfigSchema => {
  if (stoatConfig.tasks === undefined) {
    return stoatConfig;
  }

  const tasks = stoatConfig.tasks || {};
  for (const taskPlugin of Object.values(tasks)) {
    for (const [pluginField, pluginValue] of Object.entries(taskPlugin)) {
      if (pluginValue === null) {
        taskPlugin[pluginField] = {};
      }
    }
  }
  return stoatConfig;
};
