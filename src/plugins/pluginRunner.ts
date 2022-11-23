import * as core from '@actions/core';

import { JsonPlugin, StaticHostingPlugin, StoatConfigSchema } from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
import { runJsonPlugin } from './json';
import { runStaticHostingPlugin } from './staticHosting';

export const runPlugins = async (
  stoatConfig: StoatConfigSchema,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
): Promise<void> => {
  for (const [pluginId, pluginConfig] of Object.entries(stoatConfig.plugins || {})) {
    if ('static_hosting' in pluginConfig) {
      await runStaticHostingPlugin(pluginId, pluginConfig as StaticHostingPlugin, githubActionRun, stoatConfigFileId);
    } else if ('json' in pluginConfig) {
      await runJsonPlugin(pluginId, pluginConfig as JsonPlugin, githubActionRun, stoatConfigFileId);
    } else {
      core.warning(`Unknown plugin: ${pluginId}`);
    }
  }
};
