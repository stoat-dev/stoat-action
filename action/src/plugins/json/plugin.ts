import * as core from '@actions/core';
import fs from 'fs';

import { JsonPlugin, JsonPluginRendered, UploadGenericPartialConfigRequest } from '../../../../types';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from '../helpers';

const MAX_CHARACTERS = 1024;

const runJsonPlugin = async (
  taskId: string,
  taskConfig: JsonPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running json plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${taskId}] Current directory: ${process.cwd()}`);

  const jsonToUpload = taskConfig.path;
  if (!fs.existsSync(jsonToUpload)) {
    core.warning(
      `[${taskId}] JSON file to upload does not exist; it may be built in a different action: ${jsonToUpload}`
    );
    return;
  }

  const jsonString = fs.readFileSync(jsonToUpload).toString();

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
  const renderedPlugin: JsonPluginRendered = {
    ...taskConfig,
    value
  };
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    partialConfig: {
      plugins: {
        json: { [taskId]: renderedPlugin }
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
};

export default runJsonPlugin;
