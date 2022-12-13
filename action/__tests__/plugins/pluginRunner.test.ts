import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { runJobRuntimePlugin } from '../../src/plugins/jobRuntime';
import { runJsonPlugin } from '../../src/plugins/json';
import { runPlugins } from '../../src/plugins/pluginRunner';
import { runStaticHostingPlugin } from '../../src/plugins/staticHosting';
import { StoatConfigSchema } from '../../src/schemas/stoatConfigSchema';
import { GithubActionRun } from '../../src/types';

jest.mock('../../src/plugins/staticHosting');
const mockStaticHostingPlugin = runStaticHostingPlugin as jest.MockedFunction<typeof runStaticHostingPlugin>;

jest.mock('../../src/plugins/jobRuntime');
const mockJobRuntimePlugin = runJobRuntimePlugin as jest.MockedFunction<typeof runJobRuntimePlugin>;

jest.mock('../../src/plugins/json');
const mockJsonPlugin = runJsonPlugin as jest.MockedFunction<typeof runJsonPlugin>;

describe('runPlugins', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs the configured plugin as configured', async () => {
    const stoatConfig: StoatConfigSchema = {
      version: 1,
      enabled: true,
      tasks: {
        staticHostingTask1: {
          static_hosting: { path: 'path1' }
        },
        staticHostingTask2: {
          static_hosting: { path: 'path2' }
        },
        jobRuntimeTask: {
          job_runtime: null
        }
      }
    };
    await runPlugins(stoatConfig, {} as GithubActionRun, 1);
    expect(mockStaticHostingPlugin).toHaveBeenCalledTimes(2);
    expect(mockJobRuntimePlugin).toHaveBeenCalledTimes(1);
    expect(mockJsonPlugin).toHaveBeenCalledTimes(0);
  });

  it('runs the job runtime plugin by default', async () => {
    const stoatConfig: StoatConfigSchema = {
      version: 1,
      enabled: true,
      tasks: {
        staticHostingTask1: {
          static_hosting: { path: 'path1' }
        }
      }
    };
    await runPlugins(stoatConfig, {} as GithubActionRun, 1);
    expect(mockStaticHostingPlugin).toHaveBeenCalledTimes(1);
    expect(mockJobRuntimePlugin).toHaveBeenCalledTimes(1);
    expect(mockJsonPlugin).toHaveBeenCalledTimes(0);
  });
});
