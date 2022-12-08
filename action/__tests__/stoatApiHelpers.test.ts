import * as core from '@actions/core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fetch, { Response } from 'cross-fetch';

import { PROD_API_URL_BASE, getApiUrlBase } from '../src/stoatApiHelpers';

jest.mock('cross-fetch', () => jest.fn());
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

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
