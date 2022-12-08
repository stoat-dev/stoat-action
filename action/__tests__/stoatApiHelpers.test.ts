import * as core from '@actions/core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fetch, { Response } from 'cross-fetch';

import { PROD_API_URL_BASE, getApiUrlBase, getDevServerBase, waitForStoatDevServer } from '../src/stoatApiHelpers';

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
  });
});

describe('await getApiUrlBase', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({ ok: true } as Response);
  });

  describe('external repos', () => {
    it('returns production server', async () => {
      expect(await getApiUrlBase('external-org', 'repo')).toEqual(PROD_API_URL_BASE);
      expect(await getApiUrlBase('external-org', 'stoat')).toEqual(PROD_API_URL_BASE);
    });
  });

  describe('internal repos', () => {
    describe('for default branch', () => {
      beforeEach(() => {
        mockCore.getInput.mockReturnValue('main');
      });

      it('returns production server', async () => {
        expect(await getApiUrlBase('stoat-dev', 'stoat')).toEqual(PROD_API_URL_BASE);
        expect(await getApiUrlBase('stoat-dev', 'stoat-action')).toEqual(PROD_API_URL_BASE);
      });
    });

    describe('for dev branch', () => {
      beforeEach(() => {
        mockCore.getInput.mockReturnValue('developer/dev-workflow');
      });

      it('returns dev server', async () => {
        expect(await getApiUrlBase('stoat-dev', 'stoat')).toEqual(
          'https://stoat-git-developer-dev-workflow-stoat-dev.vercel.app'
        );
      });

      describe('when dev server is down', () => {
        beforeEach(() => {
          mockFetch.mockRejectedValue(new Error('Network error'));
        });

        it('returns production server', async () => {
          expect(await getApiUrlBase('stoat-dev', 'stoat')).toEqual(PROD_API_URL_BASE);
        });
      });
    });
  });
});

describe('waitForStoatDevServer', () => {
  const repoSha = 's1';

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true } as Response);
  });

  describe('non-stoat repos', () => {
    it('does not wait', async () => {
      expect(await waitForStoatDevServer({ owner: 'external-org', repo: 'repo' }, 'b1', repoSha)).toEqual(false);
      expect(await waitForStoatDevServer({ owner: 'stoat-dev', repo: 'stoat-action' }, 'b1', repoSha)).toEqual(false);
      expect(await waitForStoatDevServer({ owner: 'stoat-dev', repo: 'examples' }, 'b1', repoSha)).toEqual(false);
    });
  });

  describe('stoat repo', () => {
    it('does not wait for main branch', async () => {
      expect(await waitForStoatDevServer({ owner: 'stoat-dev', repo: 'stoat' }, 'main', repoSha)).toEqual(false);
    });

    it('waits for dev branch', async () => {
      mockFetch
        .mockRejectedValueOnce({
          ok: true,
          json: async () => ({ sha: 'irrelevant-sha' })
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ sha: repoSha })
        } as Response);

      expect(
        await waitForStoatDevServer(
          {
            owner: 'stoat-dev',
            repo: 'stoat'
          },
          'dev/feature1',
          repoSha
        )
      ).toEqual('https://stoat-git-dev-feature1-stoat-dev.vercel.app');
    });

    it('throws when the dev server is down', () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      expect(waitForStoatDevServer({ owner: 'stoat-dev', repo: 'stoat' }, 'dev/feature1', repoSha)).rejects.toThrow(
        'Network error'
      );
    });
  });
});
