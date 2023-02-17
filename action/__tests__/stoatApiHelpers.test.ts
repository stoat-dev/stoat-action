import * as core from '@actions/core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fetch, { Response } from 'cross-fetch';
import _ from 'lodash';

import {
  INTERNAL_REPO_DEFAULT_BRANCH,
  PROD_API_URL_BASE,
  STOAT_ORG,
  STOAT_REPO,
  getApiUrlBase,
  getDevServerBase,
  waitForStoatDevServer
} from '../src/stoatApiHelpers';

jest.mock('cross-fetch', () => jest.fn());
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

describe('getDevServerBase', () => {
  it('returns the correct dev server base', () => {
    expect(getDevServerBase('token1')).toEqual('https://stoat-git-token1-stoat-dev.vercel.app');
    expect(getDevServerBase('token1/token2_token3$token4')).toEqual(
      'https://stoat-git-token1-token2-token3-token4-stoat-dev.vercel.app'
    );
    expect(getDevServerBase('a/b-c-0.0.0')).toEqual('https://stoat-git-a-b-c-000-stoat-dev.vercel.app');
  });

  it('returns the prod server if the subdomain is too long', () => {
    expect(getDevServerBase(_.repeat('token-', 10))).toEqual(PROD_API_URL_BASE);
  });
});

describe('await getApiUrlBase', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({ ok: true } as Response);
  });

  describe('external repos', () => {
    it('returns production server', async () => {
      expect(await getApiUrlBase('external-org', 'repo')).toEqual(PROD_API_URL_BASE);
      expect(await getApiUrlBase('external-org', STOAT_REPO)).toEqual(PROD_API_URL_BASE);
    });
  });

  describe('internal repos', () => {
    describe('for default branch', () => {
      beforeEach(() => {
        mockCore.getInput.mockReturnValue(INTERNAL_REPO_DEFAULT_BRANCH);
      });

      it('returns production server', async () => {
        expect(await getApiUrlBase(STOAT_ORG, STOAT_REPO)).toEqual(PROD_API_URL_BASE);
        expect(await getApiUrlBase(STOAT_ORG, 'stoat-action')).toEqual(PROD_API_URL_BASE);
      });
    });

    describe('for dev branch', () => {
      beforeEach(() => {
        mockCore.getInput.mockReturnValue('developer/dev-workflow');
      });

      it('returns dev server', async () => {
        expect(await getApiUrlBase(STOAT_ORG, STOAT_REPO)).toEqual(
          'https://stoat-git-developer-dev-workflow-stoat-dev.vercel.app'
        );
      });

      describe('when dev server is down', () => {
        beforeEach(() => {
          mockFetch.mockRejectedValue(new Error('Network error'));
        });

        it('returns production server', async () => {
          expect(await getApiUrlBase(STOAT_ORG, STOAT_REPO)).toEqual(PROD_API_URL_BASE);
        });
      });
    });
  });
});

describe('waitForStoatDevServer', () => {
  const repoSha = 's1';

  beforeEach(() => {
    mockFetch.mockResolvedValue({ ok: true } as Response);
  });

  describe('non-stoat repos', () => {
    it('does not wait', async () => {
      expect(
        await waitForStoatDevServer(
          {
            owner: 'external-org',
            repo: 'repo'
          },
          'b1',
          repoSha
        )
      ).toEqual(false);
      expect(
        await waitForStoatDevServer(
          {
            owner: STOAT_ORG,
            repo: 'stoat-action'
          },
          'b1',
          repoSha
        )
      ).toEqual(false);
      expect(
        await waitForStoatDevServer(
          {
            owner: STOAT_ORG,
            repo: 'examples'
          },
          'b1',
          repoSha
        )
      ).toEqual(false);
    });
  });

  describe('stoat repo', () => {
    it('does not wait for main branch', async () => {
      expect(
        await waitForStoatDevServer(
          {
            owner: STOAT_ORG,
            repo: STOAT_REPO
          },
          INTERNAL_REPO_DEFAULT_BRANCH,
          repoSha
        )
      ).toEqual(false);
    });

    it('waits for dev branch', async () => {
      mockFetch
        // the dev server is not be available
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Not Found' })
        } as Response)
        // the dev server is available but the commit is not deployed
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sha: 'irrelevant-sha' })
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => ({ sha: repoSha })
        } as Response);

      expect(
        await waitForStoatDevServer(
          {
            owner: STOAT_ORG,
            repo: STOAT_REPO
          },
          'dev/feature1',
          repoSha,
          1
        )
      ).toEqual('https://stoat-git-dev-feature1-stoat-dev.vercel.app');

      const infos = mockCore.info.mock.calls;
      expect(infos[0][0]).toContain('Waiting for dev server');
      expect(infos[1][0]).toContain('Dev server is not up running yet');
      expect(infos[2][0]).toContain('Waiting / retrying for latest change');
      expect(infos[3][0]).toContain('Matches: false');
      expect(infos[4][0]).toContain('Waiting / retrying for latest change');
      expect(infos[5][0]).toContain('Matches: true');
    });

    it('throws when the dev server is down', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await expect(async () =>
        waitForStoatDevServer({ owner: STOAT_ORG, repo: STOAT_REPO }, 'dev/feature1', repoSha)
      ).rejects.toThrowError();
    });
  });
});
