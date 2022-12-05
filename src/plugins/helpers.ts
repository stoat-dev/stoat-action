import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { API_URL_BASE } from '../stoatApiHelpers';
import { UploadPartialConfigRequest, UploadPartialConfigResponse } from '../types';

export const submitPartialConfig = async <T extends UploadPartialConfigRequest>(
  taskId: string,
  apiSuffix: string,
  requestBody: T
) => {
  core.info(`[${taskId}] Submitting partial config...`);
  const staticHostingApiUrl = `${API_URL_BASE}/api/plugins/${apiSuffix}`;
  const response = await fetch(staticHostingApiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
  core.info(`[${taskId}] Partial config submission response: ${response.status} - ${response.statusText}`);
  if (!response.ok) {
    core.error('Failed to run static hosting plugin');
    return;
  }
  const { partialConfigId } = (await response.json()) as UploadPartialConfigResponse;
  core.info(`[${taskId}] Created partial config ${partialConfigId}`);
};
