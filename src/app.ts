import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';

import { uploadWorkflowOutputs } from './commentHelpers';
import { runPlugins } from './plugins/pluginRunner';
import { getCurrentPullRequestNumber } from './pullRequestHelpers';
import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import stoatSchema from './schemas/stoatConfigSchema.json';
import { waitForShaToMatch } from './stoatApiHelpers';
import { GithubActionRun, Repository } from './types';

const ajv = new Ajv();

async function getGhCommitTimestamp(
  octokit: InstanceType<typeof GitHub>,
  repository: Repository,
  repoSha: string
): Promise<Date> {
  try {
    const response = await octokit.rest.repos.getCommit({
      owner: repository.owner,
      repo: repository.repo,
      ref: repoSha
    });

    const dateStr = response.data.commit.committer?.date;

    if (dateStr === undefined) {
      throw Error('Date string retrieved was empty!');
    } else {
      core.info(`Retrieved date string: ${dateStr}`);
      const parsedDate = new Date(dateStr);
      core.info(`Parsed date as: ${parsedDate}`);
      return parsedDate;
    }
  } catch (error: any) {
    throw Error(`Failed to retrieve commit timestamp: ${error.message}`);
  }
}

async function run(stoatConfig: any) {
  core.info('Validating Stoat config file...');
  const validate = ajv.compile(stoatSchema);
  const valid = validate(stoatConfig);

  if (!valid) {
    core.error((validate.errors ?? []).map((e) => e.message).join('; '));
    throw new Error('Failed to validate Stoat config file!');
  }
  const typedStoatConfig = stoatConfig as StoatConfigSchema;

  core.info('Initializing Octokit...');
  const octokit = github.getOctokit(core.getInput('token'));

  core.info('Fetching current pull request number...');
  const pullRequestNumber = await getCurrentPullRequestNumber(octokit, github.context.repo, github.context.sha);

  if (pullRequestNumber === null) {
    core.info(`Build not associated with a pull request.`);
  } else {
    core.info(`Detected pull request number: ${pullRequestNumber}`);
  }

  core.info(`Fetching repo's sha (not the build's merge commit sha)...`);
  const repoSha = core.getInput('actual_sha');

  core.info('Checking if prior steps succeeded...');
  let stepsSucceeded = true;

  const jobListResponse = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    run_id: github.context.runId
  });

  // todo: in the future we may want to determine which job we're currently in
  // with matrix jobs and such this can be difficult to determine
  // see https://github.com/actions/toolkit/issues/550 and the other plethora of issues complaining about this
  for (const job of jobListResponse.data.jobs) {
    core.info(`Inspecting job name: ${job.name}`);
    for (const step of job.steps || []) {
      core.info(`Step "${step.name}" has conclusion: ${step.conclusion}`);
      if (step.conclusion !== null && step.conclusion !== 'skipped') {
        stepsSucceeded = stepsSucceeded && step.conclusion === 'success';
      }
    }
  }

  core.info(`Prior steps succeeded: ${stepsSucceeded}`);

  core.info('Waiting for api server to be deployed...');
  await waitForShaToMatch(repoSha);

  core.info(`Fetching commit timestamp...`);
  const ghCommitTimestamp = await getGhCommitTimestamp(octokit, github.context.repo, repoSha);

  core.info('Loading template...');
  const commentTemplateFileBuffer = readFileSync(typedStoatConfig.comment_template);
  const commentTemplateFile = commentTemplateFileBuffer.toString();

  core.info('Uploading workflow outputs...');
  const githubActionRun: GithubActionRun = {
    ghRepository: github.context.repo,
    ghBranch: core.getInput('pr_branch_name'),
    ghPullRequestNumber: pullRequestNumber,
    ghWorkflow: github.context.workflow,
    ghSha: repoSha,
    ghCommitTimestamp,
    ghRunId: parseInt(core.getInput('run_id')),
    ghRunNumber: parseInt(core.getInput('run_number')),
    ghRunAttempt: parseInt(core.getInput('run_attempt'))
  };
  const stoatConfigFileId = await uploadWorkflowOutputs(typedStoatConfig, commentTemplateFile, githubActionRun);
  await runPlugins(typedStoatConfig, githubActionRun, stoatConfigFileId);
}

(async () => {
  try {
    core.info('Reading stoat config...');
    const stoatConfigFileBuffer = readFileSync('.stoat/config.yaml');
    const stoatConfig = yaml.load(stoatConfigFileBuffer.toString()) as any;

    if ('enabled' in stoatConfig && !stoatConfig.enabled) {
      core.info('Stoat is disabled! skipping...');
    } else {
      await run(stoatConfig);
    }
  } catch (error: any) {
    core.error('Stoat failed!');
    core.setFailed(error.message);
  }
})();
