import { GithubJob } from "./types";
import * as core from "@actions/core";

/**
 * @return true if:
 * - There is no "failure" conclusion.
 * - When a step has continue-on-error and failed, it is not counted as a failure.
 */
export const logPriorSteps = (jobs: GithubJob[]): boolean => {
  let stepsSucceeded = true;
  // todo: in the future we may want to determine which job we're currently in
  // with matrix jobs and such this can be difficult to determine
  // see https://github.com/actions/toolkit/issues/550 and the other plethora of issues complaining about this
  for (const job of jobs) {
    core.info(`Inspecting job "${job.name}"`);
    for (const step of job.steps || []) {
      core.info(`-- Step "${step.name}": ${step.conclusion}`);
      if (step.conclusion === 'failure') {
        stepsSucceeded = false;
      }
    }
  }
  return stepsSucceeded;
};
