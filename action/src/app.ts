import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

import { uploadWorkflowOutputs } from './commentHelpers';
import { getTypedStoatConfig, readStoatConfig } from './configHelpers';
import { runPlugins } from './plugins/pluginRunner';
import { getCurrentPullRequestNumber } from './pullRequestHelpers';
import { waitForStoatDevServer } from './stoatApiHelpers';
import { getTemplate } from './templateHelpers';
import { GithubActionRun, GithubJob, Repository } from './types';
import { logPriorSteps } from './workflowHelpers';

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

  // this is not the build's merge commit SHA
  const repoSha = core.getInput('actual_sha');
  core.info(`Repo SHA: ${repoSha}`);

  const ghBranch = core.getInput('pr_branch_name');
  await waitForStoatDevServer(github.context.repo, ghBranch, repoSha);

  core.info(`Fetching commit timestamp...`);
  const ghCommitTimestamp = await getGhCommitTimestamp(octokit, github.context.repo, repoSha);

  // find the current job
  const jobListResponse = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    run_id: github.context.runId
  });
  const ghJobId = github.context.job;
  const ghJobRunId = github.context.runId;
  // There is no accurate way to find the current running job. To do that,
  // we need to use an identifier from the github.context and search for
  // it in the job list. When the job has no custom name, this works, because
  // both github.context.job and job.name are job ids. However, when the job
  // has a custom name or there are matrix variants, job.name refers to the
  // custom name or a name with the matrix variants. In that case, nothing
  // from github.context can be used to find the job.
  const ghJob: GithubJob | undefined = jobListResponse.data.jobs.find(
    (j) => j.run_id === ghJobRunId && j.status !== 'completed'
  );
  if (ghJob !== undefined) {
    core.info(`Current job: ${JSON.stringify(ghJob)}`);
  } else {
    core.warning(
      `Could not find job information for job "${ghJobId}" (job run id ${ghJobRunId}) in the job list: ${JSON.stringify(
        jobListResponse.data.jobs,
        null,
        2
      )}`
    );
  }

  core.info('Checking if prior steps succeeded...');
  const stepsSucceeded = logPriorSteps(ghJob);
  core.info(`Prior steps succeeded: ${stepsSucceeded}`);

  const githubActionRun: GithubActionRun = {
    ghRepository: github.context.repo,
    ghBranch,
    ghPullRequestNumber: pullRequestNumber,
    ghWorkflow: github.context.workflow,
    ghJob,
    ghSha: repoSha,
    ghCommitTimestamp,
    ghRunId: parseInt(core.getInput('run_id')),
    ghRunNumber: parseInt(core.getInput('run_number')),
    ghRunAttempt: parseInt(core.getInput('run_attempt')),
    ghToken: token,
    stepsSucceeded
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
