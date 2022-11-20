import github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { components } from '@octokit/openapi-types';

import { Repository } from './types';

type PullRequest = components['schemas']['pull-request-simple'];

async function getAllPullRequestsForCommit(
  octokit: InstanceType<typeof GitHub>,
  repository: Repository,
  sha: string
): Promise<PullRequest[]> {
  try {
    const result = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner: repository.owner,
      repo: repository.repo,
      commit_sha: sha
    });

    return result.data;
  } catch (error: any) {
    throw Error(`Failed to retrieve pull requests for comment: ${error.message}`);
  }
}

function findByHeadSha(pullRequests: PullRequest[], sha: string) {
  return pullRequests.find((pullRequest) => pullRequest.head.sha.startsWith(sha));
}

function getLastPullRequest(pullRequests: PullRequest[], sha: string): PullRequest | null {
  if (pullRequests.length > 0) {
    const preferredChoice = findByHeadSha(pullRequests, sha);
    return preferredChoice || pullRequests[0];
  } else {
    return null;
  }
}

function getPullRequestNumberFromContext(): number | null {
  try {
    return github.context.issue.number || null;
  } catch (e) {
    return null;
  }
}

export async function getCurrentPullRequestNumber(
  octokit: InstanceType<typeof GitHub>,
  repository: Repository,
  sha: string
): Promise<number | null> {
  const pullRequestNumberFromContext = getPullRequestNumberFromContext();

  if (pullRequestNumberFromContext !== null) {
    return pullRequestNumberFromContext;
  } else {
    const allPullRequests = await getAllPullRequestsForCommit(octokit, repository, sha);
    const pullRequest = getLastPullRequest(allPullRequests, sha);

    return pullRequest ? pullRequest.number : null;
  }
}
