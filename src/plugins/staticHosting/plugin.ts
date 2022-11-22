import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fetch from 'cross-fetch';
import fs from 'fs';

import { StaticHostingPlugin } from '../../schemas/stoatConfigSchema';
import { API_URL_BASE } from '../../stoatApiHelpers';
import {
  GetSurgeCredentialRequest,
  GetSurgeCredentialResponse,
  GithubActionRun,
  UploadStaticHostingRequest,
  UploadStaticHostingResponse
} from '../../types';
import { getUploadSubdomain } from './helpers';

const domain = 'surge.sh';

const runStaticHostingPlugin = async (
  pluginId: string,
  pluginConfig: StaticHostingPlugin,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${pluginId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);

  const pathToUpload = pluginConfig.static_hosting.path;
  if (!fs.existsSync(pathToUpload)) {
    core.warning(`[${pluginId}] Path to upload does not exist; it may be built in a different action: ${pathToUpload}`);
    return;
  }

  const {
    ghToken,
    ghRepository: { repo, owner },
    ghSha
  } = githubActionRun;

  // get surge token
  const params: GetSurgeCredentialRequest = {
    stoatConfigFileId: String(stoatConfigFileId),
    ghToken
  };
  const surgeApiUrl = `${API_URL_BASE}/api/surge?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
  const surgeResponse = await fetch(surgeApiUrl, { method: 'GET' });
  const { surgeToken } = (await surgeResponse.json()) as GetSurgeCredentialResponse;

  // upload directory
  const uploadSubdomain = getUploadSubdomain(owner, repo, ghSha, pluginId);
  const uploadUrl = `${uploadSubdomain}.${domain}`;
  const installExitCode = await exec.exec('npm', ['install', '--global', 'surge'], { silent: false });
  core.info(`[${pluginId}] Install surge (exit code ${installExitCode})`);

  core.info(`[${pluginId}] Current directory: ${process.cwd()}`);
  const uploadExitCode = await exec.exec('surge', [pathToUpload, uploadUrl, '--token', surgeToken], {
    silent: false
  });
  core.info(`[${pluginId}] Upload ${pathToUpload} to ${uploadUrl} (exit code ${uploadExitCode})`);

  // submit partial config
  const staticHostingApiUrl = `${API_URL_BASE}/api/plugins/static_hostings`;
  const requestBody: UploadStaticHostingRequest = {
    ghSha,
    pluginId,
    stoatConfigFileId,
    uploadUrl: `https://${uploadUrl}`,
    ghToken
  };
  const response = await fetch(staticHostingApiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    core.error(`Failed to run static hosting plugin: ${response.statusText} (${response.status})`);
    return;
  }
  const { partialConfigId } = (await response.json()) as UploadStaticHostingResponse;
  core.info(`[${pluginId}] Created partial config ${partialConfigId}`);
};

export default runStaticHostingPlugin;
