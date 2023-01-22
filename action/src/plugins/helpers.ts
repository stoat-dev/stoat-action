import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { UploadGenericPartialConfigRequest, UploadPartialConfigResponse } from '../../../types';
import { getApiUrlBase } from '../stoatApiHelpers';

export const submitPartialConfig = async (taskId: string, requestBody: UploadGenericPartialConfigRequest) => {
  core.info(`[${taskId}] Submitting partial config...`);
  const staticHostingApiUrl = `${await getApiUrlBase(requestBody.ghOwner, requestBody.ghRepo)}/api/partial_configs`;
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
