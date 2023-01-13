import { describe, expect, it } from '@jest/globals';

import { GithubJob } from '../src/types';
import { logPriorSteps } from '../src/workflowHelpers';

describe('logPriorSteps', () => {
  it('returns true when there is no failure conclusion', () => {
    const jobs = [
      {
        name: 'test',
        steps: [
          { name: 'checkout', conclusion: 'success' },
          { name: 'test', conclusion: 'success' },
          { name: 'report', conclusion: 'skipped' },
          { name: 'upload', conclusion: 'cancelled' }
        ]
      }
    ] as GithubJob[];
    expect(logPriorSteps(jobs)).toBe(true);
  });

  it('returns false when there is a failure conclusion', () => {
    const jobs = [
      {
        name: 'test',
        steps: [
          { name: 'checkout', conclusion: 'success' },
          { name: 'test', conclusion: 'success' },
          { name: 'report', conclusion: 'failure' },
          { name: 'upload', conclusion: 'cancelled' }
        ]
      }
    ] as GithubJob[];
    expect(logPriorSteps(jobs)).toBe(false);
  });
});
