import * as core from '@actions/core';

import { StoatConfigSchema } from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
import { runStaticHostingPlugin } from './staticHosting';

export const runPlugins = async (
  stoatConfig: StoatConfigSchema,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
): Promise<void> => {
  for (const [pluginId, pluginConfig] of Object.entries(stoatConfig.plugins || {})) {
    if ('static_hosting' in pluginConfig) {
      await runStaticHostingPlugin(pluginId, pluginConfig, githubActionRun, stoatConfigFileId);
    } else {
      core.warning(`Unknown plugin: ${pluginId}`);
    }
  }
};
