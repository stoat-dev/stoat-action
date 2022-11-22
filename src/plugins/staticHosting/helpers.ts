import * as core from '@actions/core';
import * as bluebird from 'bluebird';
import fetch from 'cross-fetch';
import FormData from 'form-data';
import fs from 'fs';
import mime from 'mime-types';
import { posix, resolve } from 'path';

import { API_URL_BASE } from '../../stoatApiHelpers';
import {
  CreateSignedUrlRequest,
  CreateSignedUrlResponse,
  UploadStaticHostingRequest,
  UploadStaticHostingResponse
} from '../../types';

export const createSignedUrl = async (request: CreateSignedUrlRequest): Promise<CreateSignedUrlResponse> => {
  core.info(`[${request.pluginId}] Getting signed url...`);
  const response = await fetch(`${API_URL_BASE}/api/plugins/static_hostings/signed_url`, {
    method: 'POST',
    body: JSON.stringify(request)
  });

  const results = (await response.json()) as CreateSignedUrlResponse;
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  core.info(`[${request.pluginId}] Hosting URL: ${results.hostingUrl}`);
  return results;
};

export const uploadFileWithSignedUrl = async (
  signedUrl: string,
  fields: Record<string, string>,
  objectKey: string,
  localFilePath: string,
  dryRun: boolean = false
) => {
  core.info(`-- Uploading file: ${localFilePath} -> ${objectKey}`);
  if (dryRun) {
    return;
  }

  const form = new FormData();
  for (const key of Object.keys(fields)) {
    if (key !== 'key') {
      form.append(key, fields[key]);
    }
  }
  form.append('key', objectKey);
  form.append('Content-Type', mime.lookup(localFilePath) || 'application/octet-stream');
  form.append('file', fs.readFileSync(localFilePath));

  const response = await fetch(signedUrl, {
    method: 'POST',
    body: form as any
  });

  core.info(`-- Upload ${objectKey}: ${response.status} - ${response.statusText}`);
};

// Reference:
// https://github.com/elysiumphase/s3-lambo/blob/master/lib/index.js#L255
export const uploadDirectory = async (
  signedUrl: string,
  fields: Record<string, string>,
  localPathToUpload: string,
  targetDirectory: string,
  dryRun: boolean = false
) => {
  const dirPath = resolve(localPathToUpload);
  const dirStats = await fs.promises.stat(dirPath);
  const objectPrefix = targetDirectory ?? '';

  if (!dirStats.isDirectory()) {
    throw new Error(`Path is not a directory: ${dirPath}`);
  }

  try {
    const files = await fs.promises.readdir(dirPath);

    if (!Array.isArray(files)) {
      core.warning(`Empty directory is ignored: ${dirPath}`);
      return;
    }

    await bluebird.Promise.map(
      files,
      async (filename: string) => {
        const absoluteLocalPath = posix.join(dirPath, filename);
        const fileStats = await fs.promises.stat(absoluteLocalPath);
        const objectKey = posix.join(objectPrefix, filename);

        if (fileStats.isFile()) {
          await uploadFileWithSignedUrl(signedUrl, fields, objectKey, absoluteLocalPath, dryRun);
        } else if (fileStats.isDirectory()) {
          await uploadDirectory(signedUrl, fields, absoluteLocalPath, objectKey, dryRun);
        }
      },
      {
        concurrency: 10
      }
    );
  } catch (e) {
    throw new Error(`File upload failed: ${e}`);
  }
};

export const submitPartialConfig = async (
  pluginId: string,
  ghSha: string,
  ghToken: string,
  hostingUrl: string,
  stoatConfigFileId: number
) => {
  core.info(`[${pluginId}] Submitting partial config...`);
  const staticHostingApiUrl = `${API_URL_BASE}/api/plugins/static_hostings`;
  const requestBody: UploadStaticHostingRequest = {
    ghSha,
    pluginId,
    stoatConfigFileId,
    hostingUrl,
    ghToken
  };
  const response = await fetch(staticHostingApiUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
  core.info(`[${pluginId}] Submitting partial config: ${response.status} - ${response.statusText}`);
  if (!response.ok) {
    core.error(`Failed to run static hosting plugin: ${response.statusText} (${response.status})`);
    return;
  }
  const { partialConfigId } = (await response.json()) as UploadStaticHostingResponse;
  core.info(`[${pluginId}] Created partial config ${partialConfigId}`);
};
