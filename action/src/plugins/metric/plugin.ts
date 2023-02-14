import * as core from '@actions/core';
import fs from 'fs';

import {
  MetricEntry,
  MetricPlugin,
  MetricPluginRendered,
  UploadGenericPartialConfigRequest
} from '../../../../types/src';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from '../helpers';

const MAX_CHARACTERS = 10240;

const runMetricPlugin = async (
  taskId: string,
  taskConfig: MetricPlugin,
  { ghToken, ghRepository: { repo, owner }, ghBranch, ghPullRequestNumber, ghSha }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running metric plugin (stoat config ${stoatConfigFileId})`);
  const metricFile = taskConfig.filename;
  if (!fs.existsSync(metricFile)) {
    core.info(`[${taskId}] Metric file does not exist: ${metricFile} in the current job. Skip.`);
    return;
  }

  const metricJsonString = fs.readFileSync(metricFile).toString();
  if (metricJsonString.length > MAX_CHARACTERS) {
    core.error(
      `[${taskId}] Metric file exceeds character limit. Limit: ${MAX_CHARACTERS}. Actual: ${metricJsonString.length}. Skip.`
    );
    return;
  }

  let metricJson: MetricEntry;
  try {
    metricJson = JSON.parse(metricJsonString);
  } catch (e) {
    core.error(`[${taskId}] Metric file does not have valid JSON contents: ${metricFile}. Skip.`);
    return;
  }
  const { group, value } = metricJson;

  const renderedPlugin: MetricPluginRendered = {
    ...taskConfig,
    values: [
      {
        ghBranch,
        ghPullRequestNumber: ghPullRequestNumber || undefined,
        ghSha,
        value,
        group
      }
    ]
  };
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
        metric: { [taskId]: renderedPlugin }
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
};

export default runMetricPlugin;
