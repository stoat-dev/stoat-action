import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { API_URL_BASE } from '../../stoatApiHelpers';
import { UploadJsonRequest, UploadJsonResponse } from '../../types';

export const submitPartialConfig = async (
  pluginId: string,
  ghSha: string,
  ghToken: string,
  value: object,
  stoatConfigFileId: number
) => {
  core.info(`[${pluginId}] Submitting partial config...`);
  const jsonApiUrl = `${API_URL_BASE}/api/plugins/jsons`;
  const requestBody: UploadJsonRequest = {
    ghSha,
    pluginId,
    stoatConfigFileId,
    value,
    ghToken
  };

  const response = await fetch(jsonApiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });

  core.info(`[${pluginId}] Partial config submission response: ${response.status} - ${response.statusText}`);
  if (!response.ok) {
    core.error(`Failed to run static hosting plugin: ${response.statusText} (${response.status})`);
    return;
  }

  const { partialConfigId } = (await response.json()) as UploadJsonResponse;

  core.info(`[${pluginId}] Created partial config ${partialConfigId}`);
};
