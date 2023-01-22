import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ModuleMocker } from 'jest-mock';

import { StaticHostingPlugin } from '../../../../types';
import { runStaticHostingPlugin } from '../../../src/plugins/staticHosting';
import { GithubActionRun, GithubJob } from '../../../src/types';

describe('static hosting plugin', () => {
  const githubActionRun: GithubActionRun = {
    ghRepository: {
      owner: 'test-owner',
      repo: 'test-repo'
    },
    ghBranch: 'branch',
    ghPullRequestNumber: 1,
    ghWorkflow: 'workflow',
    ghJob: {} as GithubJob,
    ghSha: 'sha',
    ghCommitTimestamp: new Date(),
    ghRunId: 1000,
    ghRunNumber: 2000,
    ghRunAttempt: 1,
    ghToken: 'token',
    stepsSucceeded: true
  };

  let stdoutWriteSpy: ReturnType<ModuleMocker['spyOn']>;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  for (const path of ['', '.', './', '__tests__/..', '../action']) {
    it(`forbids upload of project root directory (path = "${path}")`, async () => {
      const taskConfig: StaticHostingPlugin = {
        path
      };
      expect(async () => await runStaticHostingPlugin('test-task', taskConfig, githubActionRun, 1)).not.toThrow();
      const lastCallArguments = stdoutWriteSpy.mock.calls.pop();
      expect(lastCallArguments.length).toBe(1);
      expect(lastCallArguments[0]).toContain('project root directory cannot be uploaded for hosting');
    });
  }
});
