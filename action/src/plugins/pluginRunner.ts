import * as core from '@actions/core';

import { JobRuntimePlugin, JsonPlugin, StaticHostingPlugin, StoatConfigSchema } from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
import { runJobRuntimePlugin } from './jobRuntime';
import { runJsonPlugin } from './json';
import { runStaticHostingPlugin } from './staticHosting';

export const runPlugins = async (
  stoatConfig: StoatConfigSchema,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
): Promise<void> => {
  let hasJobRuntime = false;
  for (const [taskId, taskConfig] of Object.entries(stoatConfig.tasks || {})) {
    if ('static_hosting' in taskConfig) {
      await runStaticHostingPlugin(taskId, taskConfig as StaticHostingPlugin, githubActionRun, stoatConfigFileId);
    } else if ('json' in taskConfig) {
      await runJsonPlugin(taskId, taskConfig as JsonPlugin, githubActionRun, stoatConfigFileId);
    } else if ('job_runtime' in taskConfig) {
      hasJobRuntime = true;
      await runJobRuntimePlugin(taskId, taskConfig as JobRuntimePlugin, githubActionRun, stoatConfigFileId);
    } else {
      core.warning(`Unknown plugin: ${taskId}`);
    }
  }
  if (!hasJobRuntime) {
    const defaultJobRuntimeConfig: JobRuntimePlugin = { job_runtime: {} };
    await runJobRuntimePlugin('default-job-runtime', defaultJobRuntimeConfig, githubActionRun, stoatConfigFileId);
  }
};
