import * as core from '@actions/core';
import { randomUUID } from 'crypto';
import fs from 'fs';
import Jimp from 'jimp';
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

  // read image
  const uuid = randomUUID();
  const imagePath = `${currentDirectory}/${uuid}-image.png`;
  await Jimp.read(taskConfig.image, (error, image) => {
    if (error) {
      throw error;
    }
    image.write(imagePath);
  });
  const imagePng = PNG.sync.read(fs.readFileSync(imagePath));
  const { width, height } = imagePng;

  // read baseline and resize
  const baselinePath = `${currentDirectory}/${uuid}-baseline.png`;
  await Jimp.read(taskConfig.baseline, (error, image) => {
    if (error) {
      throw error;
    }
    image.resize(width, height).write(baselinePath);
  });
  const baselinePng = PNG.sync.read(fs.readFileSync(baselinePath));

  // create diff
  const diffPath = `${currentDirectory}/${uuid}-diff.png`;
  core.info(`[${taskId}] Creating image diff to ${diffPath}...`);

  const diffImage = new PNG({ width, height });
  pixelmatch(baselinePng.data, imagePng.data, diffImage.data, width, height, { threshold: 0.1 });
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
  core.info(`[${taskId}] Uploading ${imagePath} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, imagePath, objectPath);
  core.info(`[${taskId}] Uploaded ${baselinePath} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, baselinePath, objectPath);
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
    imageUrl: `${hostingUrl}/${basename(imagePath)}`,
    baselineUrl: `${hostingUrl}/${basename(baselinePath)}`,
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
