import * as core from '@actions/core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { PROD_API_URL_BASE, getApiUrlBase } from '../src/stoatApiHelpers';

jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

describe('getApiUrlBase', () => {
  describe('external repos', () => {
    it('returns production server', () => {
      expect(getApiUrlBase('external-org', 'repo')).toEqual(PROD_API_URL_BASE);
      expect(getApiUrlBase('external-org', 'stoat')).toEqual(PROD_API_URL_BASE);
    });
  });

  describe('internal repos', () => {
    describe('for default branch', () => {
      beforeEach(() => {
        mockCore.getInput.mockReturnValue('main');
      });

      it('returns production server', () => {
        expect(getApiUrlBase('stoat-dev', 'stoat')).toEqual(PROD_API_URL_BASE);
        expect(getApiUrlBase('stoat-dev', 'stoat-action')).toEqual(PROD_API_URL_BASE);
      });
    });

    describe('for dev branch', () => {
      beforeEach(() => {
        mockCore.getInput.mockReturnValue('developer/dev-workflow');
      });

      it('returns dev server', () => {
        expect(getApiUrlBase('stoat-dev', 'stoat')).toEqual(
          'https://stoat-git-developer-dev-workflow-stoat-dev.vercel.app'
        );
      });
    });
  });
});
