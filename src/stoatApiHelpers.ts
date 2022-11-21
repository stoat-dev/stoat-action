import * as core from '@actions/core';
import fetch from 'cross-fetch';

interface ShaResponse {
  sha: string;
}

export const API_URL_BASE = 'https://www.stoat.dev';

export async function waitForShaToMatch(repoSha: string) {
  const url = `${API_URL_BASE}/api/debug/sha`;

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
