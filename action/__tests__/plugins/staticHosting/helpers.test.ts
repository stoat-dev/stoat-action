import * as core from '@actions/core';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import fetch, { Response } from 'cross-fetch';

import { uploadFileWithSignedUrl } from '../../../src/plugins/staticHosting/helpers';

jest.mock('cross-fetch', () => jest.fn());
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

describe('uploadFileWithSignedUrl', function () {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when there is no error', function () {
    it('uploads the file with one fetch call', async () => {
      mockFetch.mockResolvedValue({ ok: true } as Response);
      await uploadFileWithSignedUrl('https://localhost', {}, 'object-key', 'package.json');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('when there is 503 error', function () {
    const response503 = { ok: false, status: 503, statusText: 'Slow down' } as Response;

    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce(response503)
        .mockResolvedValueOnce(response503)
        .mockResolvedValue({ ok: true, status: 204, statusText: 'No content' } as Response);
    });

    it('retries', async () => {
      await uploadFileWithSignedUrl('https://localhost', {}, 'object-key', 'package.json');
      expect(mockFetch).toHaveBeenCalledTimes(3);

      const warnings = mockCore.warning.mock.calls;
      expect(warnings.length).toEqual(2);
      warnings.forEach((warning) => {
        expect(warning[0]).toContain('503 error');
      });
    });
  });
});
