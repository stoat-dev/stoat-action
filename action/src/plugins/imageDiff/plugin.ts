import * as core from '@actions/core';
import { randomUUID } from 'crypto';
import fs from 'fs';
import _ from 'lodash';
import { basename } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { ImageDiffPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun, UploadImageDiffRequest } from '../../types';
import { submitPartialConfig } from '../helpers';
import { createSignedUrl, uploadPath } from '../staticHosting/helpers';

const runImageDiffPlugin = async (
  taskId: string,
  taskConfig: ImageDiffPlugin,
  { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);
  const currentDirectory = process.cwd();
  core.info(`[${taskId}] Current directory: ${currentDirectory}`);

  if (!isFileExist(taskId, 'image', taskConfig.image)) {
    return;
  }
  // TODO: when baseline is undefined, default to the path on main branch
  if (!isFileExist(taskId, 'baseline', taskConfig.baseline)) {
    return;
  }

  // create diff image
  const uuid = randomUUID();
  const diffPath = `${currentDirectory}/${uuid}-diff.png`;
  core.info(`[${taskId}] Creating image diff to ${diffPath}...`);
  const baselineImage = PNG.sync.read(fs.readFileSync(taskConfig.baseline));
  const currentImage = PNG.sync.read(fs.readFileSync(taskConfig.image));
  const { width, height } = baselineImage;
  const diffImage = new PNG({ width, height });
  pixelmatch(baselineImage.data, currentImage.data, diffImage.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
  core.info(`[${taskId}] Created image diff`);

  // get signed url
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    filename: undefined
  });

  // upload three images
  core.info(`[${taskId}] Uploading ${taskConfig.image} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, taskConfig.image, objectPath);
  core.info(`[${taskId}] Uploaded ${taskConfig.baseline} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, taskConfig.baseline, objectPath);
  core.info(`[${taskId}] Uploaded ${diffPath} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, diffPath, objectPath);

  // submit partial config
  const requestBody: UploadImageDiffRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    imageUrl: `${hostingUrl}/${basename(taskConfig.image)}`,
    baselineUrl: `${hostingUrl}/${basename(taskConfig.baseline)}`,
    diffUrl: `${hostingUrl}/${basename(diffPath)}`
  };
  await submitPartialConfig<UploadImageDiffRequest>(taskId, 'image_diffs', requestBody);
};

export const isFileExist = (taskId: string, pathType: string, path?: string): boolean => {
  if (path === undefined) {
    core.warning(`[${taskId}] ${_.capitalize(pathType)} path is undefined`);
    return false;
  }
  if (!fs.existsSync(path)) {
    core.warning(`[${taskId}] No file found at ${pathType} path: ${path}`);
    return false;
  }
  return true;
};

export default runImageDiffPlugin;
