import { describe, expect, it } from '@jest/globals';

import { processNullPluginConfig } from '../src/configHelpers';
import { StoatConfigSchema } from '../src/schemas/stoatConfigSchema';

describe('processNullPluginConfig', () => {
  const stoatConfigWithoutTasks = { version: 1, enabled: true } as StoatConfigSchema;
  const stoatConfigWithEmptyTasks = { version: 1, enabled: true, tasks: {} } as StoatConfigSchema;
  const stoatConfigWithEmptyObject = {
    version: 1,
    enabled: true,
    tasks: {
      task1: { static_hosting: { path: 'path1' }, json: { path: 'path2' }, job_runtime: {} },
      task2: { job_runtime: {} },
      task3: { job_runtime: {} }
    }
  } as StoatConfigSchema;
  const stoatConfigWithNullPlugin = {
    version: 1,
    enabled: true,
    tasks: {
      task1: { static_hosting: { path: 'path1' }, json: { path: 'path2' }, job_runtime: null },
      task2: { job_runtime: null },
      task3: { job_runtime: {} }
    }
  } as StoatConfigSchema;

  it('does nothing if tasks is undefined', () => {
    expect(processNullPluginConfig(stoatConfigWithoutTasks)).toEqual(stoatConfigWithoutTasks);
  });

  it('does nothing if tasks is empty', () => {
    expect(processNullPluginConfig(stoatConfigWithEmptyTasks)).toEqual(stoatConfigWithEmptyTasks);
  });

  it('does nothing if no task plugin task config is null', () => {
    expect(processNullPluginConfig(stoatConfigWithEmptyObject)).toEqual(stoatConfigWithEmptyObject);
  });

  it('replaces null with empty object', () => {
    expect(processNullPluginConfig(stoatConfigWithNullPlugin)).toEqual(stoatConfigWithEmptyObject);
  });
});
