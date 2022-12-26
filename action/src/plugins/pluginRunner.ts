import {
  ImageDiffPlugin,
  JobRuntimePlugin,
  JsonPlugin,
  StaticHostingPlugin,
  StoatConfigSchema
} from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
import { runImageDiffPlugin } from './imageDiff';
import { runJobRuntimePlugin } from './jobRuntime';
import { runJsonPlugin } from './json';
import { runStaticHostingPlugin } from './staticHosting';

export const runPlugins = async (
  stoatConfig: StoatConfigSchema,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
): Promise<void> => {
  if (stoatConfig.plugins?.static_hosting !== undefined) {
    for (const [taskId, taskConfig] of Object.entries(stoatConfig.plugins.static_hosting)) {
      await runStaticHostingPlugin(taskId, taskConfig as StaticHostingPlugin, githubActionRun, stoatConfigFileId);
    }
  }

  if (stoatConfig.plugins?.json !== undefined) {
    for (const [taskId, taskConfig] of Object.entries(stoatConfig.plugins.json)) {
      await runJsonPlugin(taskId, taskConfig as JsonPlugin, githubActionRun, stoatConfigFileId);
    }
  }

  if (stoatConfig.plugins?.image_diff !== undefined) {
    for (const [taskId, taskConfig] of Object.entries(stoatConfig.plugins.image_diff)) {
      await runImageDiffPlugin(taskId, taskConfig as ImageDiffPlugin, githubActionRun, stoatConfigFileId);
    }
  }

  if (stoatConfig.plugins?.job_runtime?.tracking === true || stoatConfig.plugins?.job_runtime?.tracking === undefined) {
    await runJobRuntimePlugin(
      'stoat_job_runtime',
      stoatConfig.plugins?.job_runtime as JobRuntimePlugin,
      githubActionRun,
      stoatConfigFileId
    );
  }
};
