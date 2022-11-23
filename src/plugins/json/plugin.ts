import * as core from '@actions/core';
import fs, { readFileSync } from 'fs';

import { JsonPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from './helpers';

const runJsonPlugin = async (
  pluginId: string,
  pluginConfig: JsonPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${pluginId}] Running json plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${pluginId}] Current directory: ${process.cwd()}`);

  const jsonToUpload = pluginConfig.json.path;
  if (!fs.existsSync(jsonToUpload)) {
    core.warning(
      `[${pluginId}] JSON file to upload does not exist; it may be built in a different action: ${jsonToUpload}`
    );
    return;
  }

  let value;

  try {
    value = JSON.parse(readFileSync(jsonToUpload).toString());
  } catch (e) {
    const message = `JSON file to upload does not have valid JSON contents: ${jsonToUpload}`;
    core.error(message);
    throw Error(message);
  }

  // submit partial config
  await submitPartialConfig(pluginId, ghSha, ghToken, value, stoatConfigFileId);
};

export default runJsonPlugin;
