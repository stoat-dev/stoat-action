import { describe, expect, it } from '@jest/globals';

import { GithubJob } from '../src/types';
import { isJobMatchMatrixVariant, logPriorSteps } from '../src/workflowHelpers';

describe('logPriorSteps', () => {
  it('returns true when there is no failure conclusion', () => {
    const job = {
      name: 'test',
      steps: [
        { name: 'checkout', conclusion: 'success' },
        { name: 'test', conclusion: 'success' },
        { name: 'report', conclusion: 'skipped' },
        { name: 'upload', conclusion: 'cancelled' },
        { name: 'cleanup', conclusion: undefined }
      ]
    } as GithubJob;
    expect(logPriorSteps(job)).toBe(true);
  });

  it('returns false when there is failure conclusion', () => {
    const job = {
      name: 'test',
      steps: [
        { name: 'checkout', conclusion: 'success' },
        { name: 'test', conclusion: 'success' },
        { name: 'report', conclusion: 'failure' },
        { name: 'upload', conclusion: 'cancelled' }
      ]
    } as GithubJob;
    expect(logPriorSteps(job)).toBe(false);
  });
});

describe('isJobMatchMatrixVariant', () => {
  it('returns true when matrix map is null', () => {
    expect(isJobMatchMatrixVariant('test', null)).toBe(true);
  });

  it('returns true when the job name matches a single variant', () => {
    // string variant
    expect(isJobMatchMatrixVariant('test (ubuntu-latest)', { os: 'ubuntu-latest' })).toBe(true);
    expect(isJobMatchMatrixVariant('test (ubuntu-latest)', { os: 'windows-latest' })).toBe(false);

    // number variant
    expect(isJobMatchMatrixVariant('test (16)', { nodeVersion: 16 })).toBe(true);
    expect(isJobMatchMatrixVariant('test (16)', { nodeVersion: 18 })).toBe(false);
  });

  it('returns true when the job name includes all variants', () => {
    expect(
      isJobMatchMatrixVariant('test (ubuntu-latest, 12, 12)', {
        os: 'ubuntu-latest',
        nodeVersion: 12,
        number: '12'
      })
    ).toBe(true);

    expect(
      isJobMatchMatrixVariant('test (ubuntu-latest, 12, 122)', {
        os: 'ubuntu-latest',
        nodeVersion: 12,
        // this variant does not match
        number: '12'
      })
    ).toBe(false);
  });

  it('correctly parses the variants in the name', () => {
    // The job includes a distraction that looks like variants.
    // Only the strings in the second set of parentheses are true variants.
    const jobName = 'test (ubuntu-latest, 14, 12) (ubuntu-latest, 12, 12)';
    expect(
      isJobMatchMatrixVariant(jobName, {
        os: 'ubuntu-latest',
        nodeVersion: 12,
        number: '12'
      })
    ).toBe(true);

    expect(
      isJobMatchMatrixVariant(jobName, {
        os: 'ubuntu-latest',
        nodeVersion: 14,
        number: '12'
      })
    ).toBe(false);
  });
});
