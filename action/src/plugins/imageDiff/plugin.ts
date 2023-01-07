import * as core from '@actions/core';
import { randomUUID } from 'crypto';
import fs from 'fs';
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

  if (!isFileExist(taskConfig.path)) {
    core.warning(`[${taskId}] No file found for image path: ${taskConfig.path}; skipping image diff`);
    return;
  }
  // TODO: when baseline is undefined, default to the path on main branch
  if (!isFileExist(taskConfig.baseline)) {
    core.warning(`[${taskId}] Baseline image not found, skipping image diff`);
    return;
  }

  // create diff image
  const uuid = randomUUID();
  const diffPath = `${currentDirectory}/${uuid}-diff.png`;
  core.info(`[${taskId}] Creating image diff to ${diffPath}...`);
  const baselineImage = PNG.sync.read(fs.readFileSync(taskConfig.baseline));
  const currentImage = PNG.sync.read(fs.readFileSync(taskConfig.path));
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
  core.info(`[${taskId}] Uploading ${taskConfig.path} to ${objectPath}...`);
  await uploadPath(signedUrl, fields, taskConfig.path, objectPath);
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
    fileUrl: `${hostingUrl}/${basename(taskConfig.path)}`,
    baselineUrl: `${hostingUrl}/${basename(taskConfig.baseline)}`,
    diffUrl: `${hostingUrl}/${basename(diffPath)}`
  };
  await submitPartialConfig<UploadImageDiffRequest>(taskId, 'image_diffs', requestBody);
};

export const isFileExist = (path?: string): boolean => {
  return path !== undefined && fs.existsSync(path);
};

export default runImageDiffPlugin;
