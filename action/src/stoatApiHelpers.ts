import * as core from '@actions/core';
import fetch from 'cross-fetch';

interface ShaResponse {
  sha: string;
}

export const INTERNAL_REPOS = ['stoat-dev/stoat', 'stoat-dev/stoat-action'];
export const INTERNAL_REPO_DEFAULT_BRANCH = 'main';

export const PROD_API_URL_BASE = 'https://www.stoat.dev';

export const getApiUrlBase = (ghOwner: string, ghRepo: string) => {
  const repoFullName = `${ghOwner}/${ghRepo}`;
  const branchName = core.getInput('pr_branch_name');
  if (!INTERNAL_REPOS.includes(repoFullName) || branchName === INTERNAL_REPO_DEFAULT_BRANCH) {
    return PROD_API_URL_BASE;
  }

  const subdomain = branchName.replace(/[^-a-zA-Z0-9]/g, '-');
  const apiUrlBase = `https://stoat-git-${subdomain}-stoat-dev.vercel.app`;
  core.info(`Using API URL base for branch "${branchName}": ${apiUrlBase}`);
  return apiUrlBase;
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
