import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ModuleMocker } from 'jest-mock';

import { runStaticHostingPlugin } from '../../../src/plugins/staticHosting';
import { StaticHostingPlugin } from '../../../src/schemas/stoatConfigSchema';
import { GithubActionRun } from '../../../src/types';

describe('static hosting plugin', () => {
  let stdoutWriteSpy: ReturnType<ModuleMocker['spyOn']>;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forbids upload of project root directory', async () => {
    const taskConfig: StaticHostingPlugin = {
      static_hosting: {
        path: '.'
      }
    };
    const githubActionRun: GithubActionRun = {
      ghRepository: {
        owner: 'test-owner',
        repo: 'test-repo'
      },
      ghBranch: 'branch',
      ghPullRequestNumber: 1,
      ghWorkflow: 'workflow',
      ghSha: 'sha',
      ghCommitTimestamp: new Date(),
      ghRunId: 1000,
      ghRunNumber: 2000,
      ghRunAttempt: 1,
      ghToken: 'token'
    };
    expect(async () => await runStaticHostingPlugin('test-task', taskConfig, githubActionRun, 1)).not.toThrow();
    const lastCallArguments = stdoutWriteSpy.mock.calls.pop();
    expect(lastCallArguments.length).toBe(1);
    expect(lastCallArguments[0]).toContain('project root directory cannot be uploaded for hosting');
  });
});
