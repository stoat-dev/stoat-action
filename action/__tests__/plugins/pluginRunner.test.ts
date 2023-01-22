import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { GithubActionRun, StoatConfigSchema } from '../../../types';
import { runJobRuntimePlugin } from '../../src/plugins/jobRuntime';
import { runJsonPlugin } from '../../src/plugins/json';
import { runPlugins } from '../../src/plugins/pluginRunner';
import { runStaticHostingPlugin } from '../../src/plugins/staticHosting';

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
      plugins: {
        static_hosting: {
          staticHostingTask1: {
            path: 'path1'
          },
          staticHostingTask2: {
            path: 'path2'
          }
        },
        job_runtime: {
          enabled: true
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
      plugins: {
        static_hosting: {
          staticHostingTask1: {
            path: 'path1'
          }
        }
      }
    };
    await runPlugins(stoatConfig, {} as GithubActionRun, 1);
    expect(mockStaticHostingPlugin).toHaveBeenCalledTimes(1);
    expect(mockJobRuntimePlugin).toHaveBeenCalledTimes(1);
    expect(mockJsonPlugin).toHaveBeenCalledTimes(0);
  });

  it('does not run the job runtime plugin when set to tracking disabled', async () => {
    const stoatConfig: StoatConfigSchema = {
      version: 1,
      enabled: true,
      plugins: {
        static_hosting: {
          staticHostingTask1: {
            path: 'path1'
          }
        },
        job_runtime: {
          enabled: true,
          tracking: false
        }
      }
    };
    await runPlugins(stoatConfig, {} as GithubActionRun, 1);
    expect(mockStaticHostingPlugin).toHaveBeenCalledTimes(1);
    expect(mockJobRuntimePlugin).toHaveBeenCalledTimes(0);
    expect(mockJsonPlugin).toHaveBeenCalledTimes(0);
  });
});
