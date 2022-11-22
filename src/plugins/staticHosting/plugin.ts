import * as core from '@actions/core';
import fs from 'fs';

import { StaticHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
import { createSignedUrl, submitPartialConfig, uploadDirectory } from './helpers';

const runStaticHostingPlugin = async (
  pluginId: string,
  pluginConfig: StaticHostingPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${pluginId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);
  core.info(`[${pluginId}] Current directory: ${process.cwd()}`);

  const pathToUpload = pluginConfig.static_hosting.path;
  if (!fs.existsSync(pathToUpload)) {
    core.warning(`[${pluginId}] Path to upload does not exist; it may be built in a different action: ${pathToUpload}`);
    return;
  }

  // get signed url
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    pluginId
  });

  // upload directory
  core.info(`[${pluginId}] Uploading ${pathToUpload} to ${objectPath}...`);
  await uploadDirectory(signedUrl, fields, pathToUpload, objectPath);

  // submit partial config
  await submitPartialConfig(pluginId, ghSha, ghToken, hostingUrl, stoatConfigFileId);
};

export default runStaticHostingPlugin;
