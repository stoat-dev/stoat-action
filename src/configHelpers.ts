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
  core.info('Validating Stoat config file...');
  const validate = ajv.compile(stoatSchema);
  const valid = validate(stoatConfig);

  if (!valid) {
    core.error((validate.errors ?? []).map((e) => e.message).join('; '));
    throw new Error('Failed to validate Stoat config file!');
  }
  return stoatConfig as StoatConfigSchema;
}
