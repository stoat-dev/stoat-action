import { describe, expect, it } from '@jest/globals';

import { GithubJob } from '../src/types';
import { logPriorSteps } from '../src/workflowHelpers';

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
