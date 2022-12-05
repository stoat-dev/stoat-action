import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

import { uploadWorkflowOutputs } from './commentHelpers';
import { getTypedStoatConfig, readStoatConfig } from './configHelpers';
import { runPlugins } from './plugins/pluginRunner';
import { getCurrentPullRequestNumber } from './pullRequestHelpers';
import { getTemplate } from './templateHelpers';
import { GithubActionRun, Repository } from './types';

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
  const typedStoatConfig = await getTypedStoatConfig(stoatConfig);

  core.info('Initializing Octokit...');
  const token = core.getInput('token');
  const octokit = github.getOctokit(token);

  core.info('Fetching current pull request number...');
  const pullRequestNumber = await getCurrentPullRequestNumber(octokit, github.context.repo, github.context.sha);

  if (pullRequestNumber === null) {
    core.info(`Build not associated with a pull request.`);
  } else {
    core.info(`Detected pull request number: ${pullRequestNumber}`);
  }

  core.info(`Fetching repo's SHA (not the build's merge commit SHA)...`);
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
    core.info(`Inspecting job "${job.name}"`);
    for (const step of job.steps || []) {
      core.info(`-- Step "${step.name}": ${step.conclusion}`);
      if (step.conclusion !== null && step.conclusion !== 'skipped') {
        stepsSucceeded = stepsSucceeded && step.conclusion === 'success';
      }
    }
  }

  core.info(`Prior steps succeeded: ${stepsSucceeded}`);

  core.info(`Fetching commit timestamp...`);
  const ghCommitTimestamp = await getGhCommitTimestamp(octokit, github.context.repo, repoSha);

  const githubActionRun: GithubActionRun = {
    ghRepository: github.context.repo,
    ghBranch: core.getInput('pr_branch_name'),
    ghPullRequestNumber: pullRequestNumber,
    ghWorkflow: github.context.workflow,
    ghSha: repoSha,
    ghCommitTimestamp,
    ghRunId: parseInt(core.getInput('run_id')),
    ghRunNumber: parseInt(core.getInput('run_number')),
    ghRunAttempt: parseInt(core.getInput('run_attempt')),
    ghToken: token
  };

  core.info('Loading template...');
  const { owner, repo } = githubActionRun.ghRepository;
  const commentTemplate = await getTemplate(owner, repo, typedStoatConfig);

  core.info('Uploading workflow outputs...');
  const stoatConfigFileId = await uploadWorkflowOutputs(typedStoatConfig, commentTemplate, githubActionRun);
  await runPlugins(typedStoatConfig, githubActionRun, stoatConfigFileId);
}

(async () => {
  try {
    core.info('Reading Stoat config...');
    const stoatConfig = readStoatConfig();

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
