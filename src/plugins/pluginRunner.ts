import * as core from '@actions/core';

import { StaticHostingTask, StoatConfigSchema } from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
import { runJsonPlugin } from './json';
import { runStaticHostingPlugin } from './staticHosting';

export const runPlugins = async (
  stoatConfig: StoatConfigSchema,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
): Promise<void> => {
  for (const [taskId, taskConfig] of Object.entries(stoatConfig.tasks || {})) {
    if ('static_hosting' in taskConfig) {
      await runStaticHostingPlugin(taskId, taskConfig as StaticHostingTask, githubActionRun, stoatConfigFileId);
    } else if ('json' in taskConfig) {
      await runJsonPlugin(taskId, taskConfig, githubActionRun, stoatConfigFileId);
    } else {
      core.warning(`Unknown plugin: ${taskId}`);
    }
  }
};
