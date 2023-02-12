import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { StoatConfigSchema } from '../../../types/src';
import { runAutoHostingPlugin } from '../../src/plugins/autoHosting';
import { runJobRuntimePlugin } from '../../src/plugins/jobRuntime';
import { runJsonPlugin } from '../../src/plugins/json';
import { runPlugins } from '../../src/plugins/pluginRunner';
import { runStaticHostingPlugin } from '../../src/plugins/staticHosting';
import { GithubActionRun } from '../../src/types';

jest.mock('../../src/plugins/staticHosting');
const mockStaticHostingPlugin = runStaticHostingPlugin as jest.MockedFunction<typeof runStaticHostingPlugin>;

jest.mock('../../src/plugins/jobRuntime');
const mockJobRuntimePlugin = runJobRuntimePlugin as jest.MockedFunction<typeof runJobRuntimePlugin>;

jest.mock('../../src/plugins/json');
const mockJsonPlugin = runJsonPlugin as jest.MockedFunction<typeof runJsonPlugin>;

jest.mock('../../src/plugins/autoHosting');
const mockAutoHostingPlugin = runAutoHostingPlugin as jest.MockedFunction<typeof runAutoHostingPlugin>;

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

  it('runs the auto hosting plugin by default', async () => {
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
    expect(mockAutoHostingPlugin).toHaveBeenCalledTimes(1);
    expect(mockJsonPlugin).toHaveBeenCalledTimes(0);
  });

  it('does not run the auto hosting plugin when disabled', async () => {
    const stoatConfig: StoatConfigSchema = {
      version: 1,
      enabled: true,
      plugins: {
        auto_hosting: {
          enabled: false
        },
        static_hosting: {
          staticHostingTask1: {
            path: 'path1'
          }
        }
      }
    };
    await runPlugins(stoatConfig, {} as GithubActionRun, 1);
    expect(mockStaticHostingPlugin).toHaveBeenCalledTimes(1);
    expect(mockAutoHostingPlugin).toHaveBeenCalledTimes(0);
    expect(mockJsonPlugin).toHaveBeenCalledTimes(0);
  });
});
