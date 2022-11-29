import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { API_URL_BASE } from '../../stoatApiHelpers';
import { UploadJsonRequest, UploadJsonResponse } from '../../types';

export const submitPartialConfig = async (
  taskId: string,
  ghSha: string,
  ghToken: string,
  value: object,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Submitting partial config...`);
  const jsonApiUrl = `${API_URL_BASE}/api/plugins/jsons`;
  const requestBody: UploadJsonRequest = {
    ghSha,
    taskId,
    stoatConfigFileId,
    value,
    ghToken
  };

  const response = await fetch(jsonApiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });

  core.info(`[${taskId}] Partial config submission response: ${response.status} - ${response.statusText}`);
  if (!response.ok) {
    core.error('Failed to run json plugin');
    return;
  }

  const { partialConfigId } = (await response.json()) as UploadJsonResponse;

  core.info(`[${taskId}] Created partial config ${partialConfigId}`);
};
