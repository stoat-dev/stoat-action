import * as core from '@actions/core';
import _ from 'lodash';

import { GithubJob } from './types';

/**
 * Log prior steps and return whether prior steps have succeeded. Return true
 * if there is no step with "failure" conclusion. Note that when a step has
 * continue-on-error and failed, it is not counted as a failure.
 */
export const logPriorSteps = (job: Pick<GithubJob, 'name' | 'steps'> | undefined): boolean => {
  if (job === undefined) {
    return true;
  }

  let stepsSucceeded = true;
  core.info(`Inspecting job "${job.name}"`);
  for (const step of job.steps || []) {
    core.info(`-- Step "${step.name}": ${step.conclusion}`);
    if (step.conclusion === 'failure') {
      stepsSucceeded = false;
    }
  }
  return stepsSucceeded;
};

/**
 * Check whether a job id or name contains all the matrix variants.
 */
export const isJobMatchMatrixVariant = (jobName: string, matrix: Record<string, string | number> | null): boolean => {
  if (matrix === null) {
    return true;
  }
  const variants = jobName
    .substring(jobName.lastIndexOf('(') + 1, jobName.lastIndexOf(')'))
    .split(',')
    .map((v) => v.trim());
  return _.isEqual(_.sortBy(variants), _.sortBy(Object.values(matrix).map((v) => String(v))));
};
