import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { Repository } from './types';

interface ShaResponse {
  sha: string;
}

export type DevServerCheck = { needDevServer: false } | { devServerUrl: string };

export const STOAT_ORG = 'stoat-dev';
const STOAT_REPO = 'stoat';
const STOAT_ACTION_REPO = 'stoat-action';
export const INTERNAL_REPOS = [STOAT_REPO, STOAT_ACTION_REPO];
export const INTERNAL_REPO_DEFAULT_BRANCH = 'main';

export const PROD_API_URL_BASE = 'https://www.stoat.dev';

export const getDevServerBase = (branchName: string): string => {
  const subdomain = branchName.replace(/[^-a-zA-Z0-9]/g, '-');
  return `https://stoat-git-${subdomain}-stoat-dev.vercel.app`;
};

export const getApiUrlBase = async (ghOwner: string, ghRepo: string) => {
  if (ghOwner !== STOAT_ORG || !INTERNAL_REPOS.includes(ghRepo)) {
    return PROD_API_URL_BASE;
  }

  const branchName = core.getInput('pr_branch_name');
  if (branchName === INTERNAL_REPO_DEFAULT_BRANCH) {
    return PROD_API_URL_BASE;
  }

  const devApiUrlBase = getDevServerBase(branchName);

  try {
    const response = await fetch(devApiUrlBase);
    if (response.ok) {
      return devApiUrlBase;
    }
    core.warning(`Testing connection to "${devApiUrlBase}" failed: ${response.status} - ${response.statusText}`);
  } catch (e) {
    core.warning(`Testing connection to "${devApiUrlBase}" failed: ${e}`);
  }

  core.warning(`Fall back from "${devApiUrlBase}" to ${PROD_API_URL_BASE}`);
  return PROD_API_URL_BASE;
};

/**
 * For dev work in the stoat repo, wait for the dev server and the latest SHA to be deployed.
 */
export const waitForStoatDevServer = async (
  repository: Repository,
  branchName: string,
  repoSha: string
): Promise<DevServerCheck> => {
  if (repository.owner !== STOAT_ORG || repository.repo !== STOAT_REPO || branchName === INTERNAL_REPO_DEFAULT_BRANCH) {
    return { needDevServer: false };
  }
  core.info(`Waiting for dev server to be deployed for stoat dev branch...`);
  const devServerBase = getDevServerBase(branchName);
  return waitForShaToMatch(devServerBase, repoSha);
};

export const waitForShaToMatch = async (serverBase: string, repoSha: string): Promise<DevServerCheck> => {
  const url = `${serverBase}/api/debug/sha`;

  const maxWaitingTimeSeconds = 2 * 60;
  const perAttemptWaitingSeconds = 5;
  const maxAttempts = maxWaitingTimeSeconds / perAttemptWaitingSeconds;

  let attempt: number = 0;

  while (attempt < maxAttempts) {
    ++attempt;
    const response = await fetch(url);
    if (!response.ok) {
      core.error(`Failed to fetch server SHA: ${JSON.stringify(response, null, 2)}`);
    } else {
      const { sha: serverSha } = (await response.json()) as ShaResponse;
      core.info(`Repo SHA: ${repoSha} Server SHA: ${serverSha} Matches: ${repoSha === serverSha}`);

      if (serverSha === repoSha) {
        return {
          devServerUrl: serverBase
        };
      }
    }
    core.info(`Waiting / retrying for server to be deployed...`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw Error(`Server SHA does not match repo SHA after ${maxWaitingTimeSeconds} seconds`);
};
