import * as core from '@actions/core';
import fetch from 'cross-fetch';

interface ShaResponse {
  sha: string;
}

export const STOAT_ORG = 'stoat-dev';
export const INTERNAL_REPOS = ['stoat', 'stoat-action'];
export const INTERNAL_REPO_DEFAULT_BRANCH = 'main';

export const PROD_API_URL_BASE = 'https://www.stoat.dev';

export const getApiUrlBase = async (ghOwner: string, ghRepo: string) => {
  if (ghOwner !== STOAT_ORG || !INTERNAL_REPOS.includes(ghRepo)) {
    return PROD_API_URL_BASE;
  }

  const branchName = core.getInput('pr_branch_name');
  if (branchName === INTERNAL_REPO_DEFAULT_BRANCH) {
    return PROD_API_URL_BASE;
  }

  const subdomain = branchName.replace(/[^-a-zA-Z0-9]/g, '-');
  const devApiUrlBase = `https://stoat-git-${subdomain}-stoat-dev.vercel.app`;

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
