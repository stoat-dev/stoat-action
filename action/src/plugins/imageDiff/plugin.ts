import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { randomUUID } from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import Jimp from 'jimp';
import _ from 'lodash';
import { basename } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG, PNGWithMetadata } from 'pngjs';

import { ImageDiffPlugin, ImageDiffPluginRendered, UploadGenericPartialConfigRequest } from '../../../../types/src';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from '../helpers';
import { createSignedUrl, uploadPath } from '../staticHosting/helpers';

const runImageDiffPlugin = async (
  taskId: string,
  taskConfig: ImageDiffPlugin,
  { ghToken, ghRepository: { repo, owner }, ghBranch, ghPullRequestNumber, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running image diff plugin (stoat config ${stoatConfigFileId})`);
  const currentDirectory = process.cwd();
  core.info(`[${taskId}] Current directory: ${currentDirectory}`);

  if (taskConfig.baseline === undefined && taskConfig.baseline_branch === undefined) {
    core.info(`[${taskId}] Neither baseline or baseline_branch is specified. Skip...`);
    return;
  }
  if (taskConfig.baseline_branch) {
    try {
      await exec.exec('git', ['fetch', 'origin', `${taskConfig.baseline_branch}:${taskConfig.baseline_branch}`]);
    } catch (e) {
      core.error(`[${taskId}] Error fetching baseline branch ${taskConfig.baseline_branch}: ${e}`);
      return;
    }
  }

  if (!isFileExist(taskId, 'image', taskConfig.image)) {
    core.info(`[${taskId}] Image file ${taskConfig.image} does not exist. Skip...`);
    return;
  }
  const baselineFile = await getBaselineFile(taskId, taskConfig);
  if (baselineFile === undefined) {
    core.info(`[${taskId}] Baseline file ${baselineFile} does not exist. Skip...`);
    return;
  }

  await exec.exec('npm', ['i', '-g', 'convert-svg-to-png']);

  // read image
  const uuid = randomUUID();
  const { png: imagePng, pngPath: imagePath } = await getNormalizedImage(
    taskId,
    'IMAGE',
    taskConfig.image,
    currentDirectory,
    uuid
  );
  if (imagePng === undefined) {
    return;
  }
  const { width, height } = imagePng;
  core.info(`Image size: ${width} x ${height}`);

  // read baseline and resize
  const { png: baselinePng, pngPath: baselinePath } = await getNormalizedImage(
    taskId,
    'BASELINE',
    baselineFile,
    currentDirectory,
    uuid,
    width,
    height
  );
  if (baselinePng === undefined) {
    return;
  }

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

  const renderedPlugin: ImageDiffPluginRendered = {
    ...taskConfig,
    baseline: taskConfig.baseline || taskConfig.image,
    sha: ghSha,
    image_url: `${hostingUrl}/${basename(imagePath)}`,
    baseline_url: `${hostingUrl}/${basename(baselinePath)}`,
    diff_url: `${hostingUrl}/${basename(diffPath)}`
  };

  // submit partial config
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghBranch,
    ghPullRequestNumber,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    partialConfig: {
      plugins: {
        image_diff: { [taskId]: renderedPlugin }
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
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

export const getNormalizedImage = async (
  taskId: string,
  fileType: 'IMAGE' | 'BASELINE',
  inputFilePath: string,
  currentDirectory: string,
  uuid: string,
  width?: number,
  height?: number
): Promise<{ png: PNGWithMetadata | undefined; pngPath: string }> => {
  const [filename, extension] = basename(inputFilePath).split('.');
  const outputFilePath = `${currentDirectory}/${uuid}-${fileType}-${filename}.png`;
  core.info(`[${taskId}] Converting ${fileType} ${inputFilePath} to ${outputFilePath}...`);
  try {
    if (extension.toLowerCase() === 'svg') {
      await convertSvgToPng(inputFilePath, outputFilePath);
    } else {
      const baselineFile = await Jimp.read(inputFilePath);
      if (width !== undefined && height !== undefined) {
        await baselineFile.resize(width, height).writeAsync(outputFilePath);
      } else {
        await baselineFile.writeAsync(outputFilePath);
      }
    }
  } catch (error) {
    core.error(`[${taskId}] Failed to read ${fileType} ${inputFilePath}: ${error}`);
    return {
      png: undefined,
      pngPath: ''
    };
  }
  core.info(`[${taskId}] Converted ${fileType} ${inputFilePath} to ${outputFilePath}`);
  return {
    png: PNG.sync.read(fs.readFileSync(outputFilePath)),
    pngPath: outputFilePath
  };
};

/**
 * Convert SVG to PNG and save it to the target path.
 */
export const convertSvgToPng = async (inputSvgPath: string, targetPngPath: string) => {
  const svg = fs.readFileSync(inputSvgPath, 'utf8');
  const svgParser = new XMLParser({ ignoreAttributes: false });
  const svgObject = svgParser.parse(svg);
  const [, , svgWidth, svgHeight] = String(svgObject.svg['@_viewBox'])
    .split(' ')
    .map((value: string) => parseInt(value, 10));
  await exec.getExecOutput('convert-svg-to-png', [
    '--width',
    String(svgWidth),
    '--height',
    String(svgHeight),
    inputSvgPath
  ]);
  const outputPngPath = inputSvgPath.replace('.svg', '.png');
  fs.renameSync(outputPngPath, targetPngPath);
};

export const getBaselineFile = async (taskId: string, taskConfig: ImageDiffPlugin): Promise<string | undefined> => {
  if (taskConfig.baseline === undefined) {
    core.info(`[${taskId}] Baseline is undefined, will default to image: ${taskConfig.image}`);
  }
  const baselinePath = taskConfig.baseline || taskConfig.image;

  // when baseline branch is undefined, use the file from the current branch
  if (taskConfig.baseline_branch === undefined) {
    if (!isFileExist(taskId, 'baseline', baselinePath)) {
      return undefined;
    } else {
      return baselinePath;
    }
  }

  // when baseline branch is defined, get the file from the baseline branch
  const [filename, extension] = basename(baselinePath).split('.');
  const outputFile = `${randomUUID()}-${filename}.${extension}`;
  core.info(`[${taskId}] Getting baseline file from ${taskConfig.baseline_branch}:${baselinePath} to ${outputFile}...`);
  await exec.exec('git', ['show', `${taskConfig.baseline_branch}:${baselinePath}`, '>', outputFile]);
};

export default runImageDiffPlugin;
