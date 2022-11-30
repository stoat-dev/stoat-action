import * as core from '@actions/core';

import { AutoHostingPlugin, JsonPlugin, StaticHostingPlugin, StoatConfigSchema } from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
import { runAutoHostingPlugin } from './autoHosting';
import { runJsonPlugin } from './json';
import { runStaticHostingPlugin } from './staticHosting';

export const runPlugins = async (
  stoatConfig: StoatConfigSchema,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
): Promise<void> => {
  for (const [taskId, taskConfig] of Object.entries(stoatConfig.tasks || {})) {
    if ('static_hosting' in taskConfig) {
      await runStaticHostingPlugin(taskId, taskConfig as StaticHostingPlugin, githubActionRun, stoatConfigFileId);
    } else if ('json' in taskConfig) {
      await runJsonPlugin(taskId, taskConfig as JsonPlugin, githubActionRun, stoatConfigFileId);
    } else if ('auto_hosting' in taskConfig) {
      await runAutoHostingPlugin(taskId, taskConfig as AutoHostingPlugin, githubActionRun, stoatConfigFileId);
    } else {
      core.warning(`Unknown plugin: ${taskId}, ${JSON.stringify(taskConfig)}`);
    }
  }
};
