import * as core from '@actions/core';
import fetch from 'cross-fetch';

interface ShaResponse {
  sha: string;
}

export const INTERNAL_REPOS = ['stoat', 'stoat-action'];
export const INTERNAL_REPO_DEFAULT_BRANCH = 'main';

export const PROD_API_URL_BASE = 'https://www.stoat.dev';

export const getApiUrlBase = async (ghOwner: string, ghRepo: string) => {
  if (ghOwner !== 'stoat-dev' || !INTERNAL_REPOS.includes(ghRepo)) {
    return PROD_API_URL_BASE;
  }

  const branchName = core.getInput('pr_branch_name');
  if (branchName === INTERNAL_REPO_DEFAULT_BRANCH) {
    return PROD_API_URL_BASE;
  }

  const subdomain = branchName.replace(/[^-a-zA-Z0-9]/g, '-');
  const apiUrlBase = `https://stoat-git-${subdomain}-stoat-dev.vercel.app`;
  const finalUrlBase = await testApiUrlOrFallback(apiUrlBase, PROD_API_URL_BASE);
  core.info(`Using API URL base for branch "${branchName}": ${finalUrlBase}`);
  return apiUrlBase;
};

export const testApiUrlOrFallback = async (apiUrlBase: string, fallbackUrlBase: string) => {
  const response = await fetch(apiUrlBase);
  if (response.ok) {
    return apiUrlBase;
  }

  core.warning(`Failed to connect to ${apiUrlBase}, falling back to ${fallbackUrlBase}`);
  return fallbackUrlBase;
};

export async function waitForShaToMatch(repoSha: string) {
  const url = `${PROD_API_URL_BASE}/api/debug/sha`;

  let shaMatches = false;

  let waits = 0;

  while (!shaMatches) {
    const response = await fetch(url);

    if (!response.ok) {
      throw Error(`Failed to fetch server SHA: ${JSON.stringify(response, null, 2)}`);
    }

    const data = (await response.json()) as ShaResponse;
    const serverSha = data.sha;

    core.info(`Repo SHA: ${repoSha} Server SHA: ${serverSha} Matches: ${shaMatches}`);

    if (serverSha === repoSha) {
      shaMatches = true;
    } else {
      if (waits > 20) {
        throw Error('Waited too long fer server, failing!');
      }

      await new Promise((r) => setTimeout(r, 5000));
      waits++;
    }
  }
}
