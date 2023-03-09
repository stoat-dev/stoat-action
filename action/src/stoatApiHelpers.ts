import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { Repository } from './types';

interface ShaResponse {
  sha: string;
}

export type DevServerCheck = false | string;

export const STOAT_ORG = 'stoat-dev';
export const STOAT_REPO = 'stoat';
export const STOAT_ACTION_REPO = 'stoat-action';
export const INTERNAL_REPOS = [STOAT_REPO, STOAT_ACTION_REPO, 'd2'];
export const INTERNAL_REPO_DEFAULT_BRANCH = 'main';

export const PROD_API_URL_BASE = 'https://www.stoat.dev';

export const getDevServerBase = (branchName: string): string => {
  const branchToken = branchName.replace(/\./g, '').replace(/[^-a-zA-Z0-9]/g, '-');
  const subdomain = `stoat-git-${branchToken}-stoat-dev`;
  if (subdomain.length > 63) {
    core.warning(`Subdomain "${subdomain}" is too long. Fall back to ${PROD_API_URL_BASE}.`);
    return PROD_API_URL_BASE;
  }
  return `https://${subdomain}.vercel.app`;
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

  core.warning(`Fall back to ${PROD_API_URL_BASE}`);
  return PROD_API_URL_BASE;
};

/**
 * For dev work in the stoat repo, wait for the dev server and the latest SHA to be deployed.
 */
export const waitForStoatDevServer = async (
  repository: Repository,
  branchName: string,
  repoSha: string,
  perAttemptWaitingSeconds: number = 20
): Promise<DevServerCheck> => {
  if (repository.owner !== STOAT_ORG || repository.repo !== STOAT_REPO || branchName === INTERNAL_REPO_DEFAULT_BRANCH) {
    return false;
  }
  const devServerBase = getDevServerBase(branchName);
  if (devServerBase === PROD_API_URL_BASE) {
    return false;
  }
  core.info(`Waiting for dev server to be deployed for stoat dev branch: ${devServerBase}`);
  return waitForShaToMatch(devServerBase, repoSha, perAttemptWaitingSeconds);
};

/**
 * The perAttemptWaitingSeconds is configurable for testing purposes.
 */
export const waitForShaToMatch = async (
  serverBase: string,
  repoSha: string,
  perAttemptWaitingSeconds: number = 20
): Promise<DevServerCheck> => {
  const url = `${serverBase}/api/debug/sha`;

  const maxWaitingTimeSeconds = 5 * 60;
  const maxAttempts = maxWaitingTimeSeconds / perAttemptWaitingSeconds;

  let attempt: number = 0;

  while (attempt < maxAttempts) {
    ++attempt;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        core.info('Dev server is not up running yet');
      } else {
        throw new Error(`Failed to fetch server SHA: ${response.status} - ${response.statusText}`);
      }
    } else {
      const { sha: serverSha } = (await response.json()) as ShaResponse;
      core.info(`Repo SHA: ${repoSha} Server SHA: ${serverSha} Matches: ${repoSha === serverSha}`);

      if (serverSha === repoSha) {
        return serverBase;
      }
    }
    core.info(`Waiting / retrying for latest change to be deployed...`);
    await new Promise((r) => setTimeout(r, perAttemptWaitingSeconds * 1000));
  }

  throw Error(`Server SHA does not match repo SHA after ${maxWaitingTimeSeconds} seconds`);
};
