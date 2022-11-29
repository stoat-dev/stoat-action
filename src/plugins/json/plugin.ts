import * as core from '@actions/core';
import fs, { readFileSync } from 'fs';

import { JsonPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from './helpers';

const MAX_CHARACTERS = 1024;

const runJsonPlugin = async (
  taskId: string,
  taskConfig: JsonPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running json plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${taskId}] Current directory: ${process.cwd()}`);

  const jsonToUpload = taskConfig.json.path;
  if (!fs.existsSync(jsonToUpload)) {
    core.warning(
      `[${taskId}] JSON file to upload does not exist; it may be built in a different action: ${jsonToUpload}`
    );
    return;
  }

  const jsonString = readFileSync(jsonToUpload).toString();

  if (jsonString.length > MAX_CHARACTERS) {
    const message = `JSON string exceeds character limit. Limit: ${MAX_CHARACTERS}. Actual: ${jsonString.length}`;
    core.error(message);
    throw Error(message);
  }

  let value;

  try {
    value = JSON.parse(jsonString);
  } catch (e) {
    const message = `JSON file to upload does not have valid JSON contents: ${jsonToUpload}`;
    core.error(message);
    throw Error(message);
  }

  // submit partial config
  await submitPartialConfig(taskId, ghSha, ghToken, value, stoatConfigFileId);
};

export default runJsonPlugin;
