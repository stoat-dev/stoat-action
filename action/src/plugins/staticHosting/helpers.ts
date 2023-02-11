import * as core from '@actions/core';
import * as bluebird from 'bluebird';
import fetch from 'cross-fetch';
import FormData from 'form-data';
import fs from 'fs';
// eslint-disable-next-line import/no-unresolved
import mime from 'mime-types';
import { basename, posix, resolve } from 'path';

import {
  CreateSignedUrlRequest,
  CreateSignedUrlResponse,
  StaticHostingPlugin,
  StaticHostingPluginRendered,
  UploadGenericPartialConfigRequest
} from '../../../../types/src';
import { getApiUrlBase } from '../../stoatApiHelpers';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from '../helpers';

export const processPath = async (
  taskId: string,
  taskConfig: StaticHostingPlugin,
  {
    ghRepository: { owner: ghOwner, repo: ghRepo },
    ghBranch,
    ghPullRequestNumber,
    ghSha,
    ghToken,
    stepsSucceeded
  }: Pick<
    GithubActionRun,
    'ghRepository' | 'ghBranch' | 'ghPullRequestNumber' | 'ghSha' | 'ghToken' | 'stepsSucceeded'
  >,
  stoatConfigFileId: number,
  pathToUpload: string
) => {
  // get signed url
  const isFile = fs.lstatSync(pathToUpload).isFile();
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner,
    ghRepo,
    ghSha,
    ghToken,
    taskId,
    filename: isFile ? basename(pathToUpload) : undefined
  });

  // upload directory
  core.info(`[${taskId}] Uploading ${pathToUpload} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, pathToUpload, objectPath);

  // submit partial config
  const renderedPlugin: StaticHostingPluginRendered = {
    ...taskConfig,
    sha: ghSha,
    link: taskConfig.file_viewer ? `https://www.stoat.dev/file-viewer?root=${hostingUrl}` : hostingUrl,
    status: stepsSucceeded ? '✅' : '❌'
  };
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner,
    ghRepo,
    ghBranch,
    ghPullRequestNumber,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    partialConfig: {
      plugins: {
        static_hosting: { [taskId]: renderedPlugin }
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
};

export const createSignedUrl = async (request: CreateSignedUrlRequest): Promise<CreateSignedUrlResponse> => {
  core.info(`[${request.taskId}] Getting signed url...`);
  const url = `${await getApiUrlBase(request.ghOwner, request.ghRepo)}/api/plugins/static_hostings/signed_url`;
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

  // TODO: replace the following code with a retry library
  let retry = 0;
  const maxRetry = 6;
  while (retry <= maxRetry) {
    try {
      const { ok, status, statusText } = await fetch(signedUrl, {
        method: 'POST',
        body: form as any
      });
      const retryStatus = retry > 0 ? ` (retry ${retry})` : '';
      core.info(`-- Upload ${localFilePath} -> ${objectKey}: ${status} - ${statusText}${retryStatus}`);

      if (ok) {
        break;
      } else if (status === 503) {
        const waitingMillis = 2 ** retry * 100;
        core.warning(`-- Hit 503 error, waiting for ${waitingMillis}ms before retry (${retry})...`);
        await new Promise((r) => setTimeout(r, waitingMillis));
      } else {
        core.error(`-- Failed to upload ${localFilePath}: ${status} - ${statusText}`);
      }
    } catch (e) {
      core.error(`-- Failed to upload ${localFilePath}: ${e}`);
    }
    ++retry;
  }
};

// Reference:
// https://github.com/elysiumphase/s3-lambo/blob/master/lib/index.js#L255
export const uploadPath = async (
  signedUrl: string,
  fields: Record<string, string>,
  localPathToUpload: string,
  targetDirectory: string,
  dryRun: boolean = false
) => {
  const dirPath = resolve(localPathToUpload);
  const dirStats = await fs.promises.stat(dirPath);
  const objectPrefix = targetDirectory ?? '';

  if (!dirStats.isFile() && !dirStats.isDirectory()) {
    throw new Error(`Path is neither a file or directory: ${dirPath}`);
  }

  if (dirStats.isFile()) {
    const objectKey = posix.join(objectPrefix, basename(localPathToUpload));
    await uploadFileWithSignedUrl(signedUrl, fields, objectKey, dirPath, dryRun);
    return;
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
          await uploadPath(signedUrl, fields, absoluteLocalPath, objectKey, dryRun);
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
