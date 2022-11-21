import * as core from '@actions/core';
import fetch from 'cross-fetch';

interface ShaResponse {
  sha: string;
}

/**
 * The API URL base is dynamic because we need to use Vercel preview URLs for development.
 * Once the action is ready to ship, it should always use the production URL.
 */
const getApiUrlBase = () => {
  core.info(`Github ref: ${core.getInput('pr_branch_name')}`);
  const subdomain = core.getInput('pr_branch_name').replace('/', '-');
  const apiUrlBase = `https://stoat-git-${subdomain}-distinct.vercel.app`;
  core.info(`Using API URL base: ${apiUrlBase}`);
  return apiUrlBase;
};

export const API_URL_BASE = getApiUrlBase();

export async function waitForShaToMatch(repoSha: string) {
  const url = `${API_URL_BASE}/api/debug/sha`;

  let shaMatches = false;

  let waits = 0;

  while (!shaMatches) {
    const response = await fetch(url);

    if (!response.ok) {
      core.error(`Failed to fetch server SHA: ${JSON.stringify(response, null, 2)}`);
      throw Error('Request to get server sha failed!');
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
