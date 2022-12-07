import * as core from '@actions/core';
import * as bluebird from 'bluebird';
import fetch from 'cross-fetch';
import FormData from 'form-data';
import fs from 'fs';
// eslint-disable-next-line import/no-unresolved
import mime from 'mime-types';
import { posix, resolve } from 'path';

import { getApiUrlBase } from '../../stoatApiHelpers';
import { CreateSignedUrlRequest, CreateSignedUrlResponse } from '../../types';

export const createSignedUrl = async (request: CreateSignedUrlRequest): Promise<CreateSignedUrlResponse> => {
  core.info(`[${request.taskId}] Getting signed url...`);
  const url = `${getApiUrlBase(request.ghOwner, request.ghRepo)}/api/plugins/static_hostings/signed_url`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(request)
  });

  const results = (await response.json()) as CreateSignedUrlResponse;
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  core.info(`[${request.taskId}] Hosting URL: ${results.hostingUrl}`);
  return results;
};

export const uploadFileWithSignedUrl = async (
  signedUrl: string,
  fields: Record<string, string>,
  objectKey: string,
  localFilePath: string,
  dryRun: boolean = false
) => {
  if (dryRun) {
    core.info(`-- [DryRun] Upload ${localFilePath} -> ${objectKey}`);
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

  core.info(`-- Upload ${localFilePath} -> ${objectKey}: ${response.status} - ${response.statusText}`);
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
