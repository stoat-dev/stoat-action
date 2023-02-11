import {
  AutoHostingPlugin,
  ImageDiffPlugin,
  JobRuntimePlugin,
  JsonPlugin,
  StaticHostingPlugin,
  StoatConfigSchema,
  WorkflowDispatchPlugin
} from '../../../types/src';
import { GithubActionRun } from '../types';
import { runAutoHostingPlugin } from './autoHosting';
import { runImageDiffPlugin } from './imageDiff';
import { runJobRuntimePlugin } from './jobRuntime';
import { runJsonPlugin } from './json';
import { runStaticHostingPlugin } from './staticHosting';
import { runWorkflowDispatchPlugin } from './workflowDispatch';

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

  if (stoatConfig.plugins?.workflow_dispatch !== undefined) {
    for (const [taskId, taskConfig] of Object.entries(stoatConfig.plugins.workflow_dispatch)) {
      await runWorkflowDispatchPlugin(taskId, taskConfig as WorkflowDispatchPlugin, githubActionRun, stoatConfigFileId);
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

  if (stoatConfig.plugins?.auto_hosting?.enabled === true) {
    await runAutoHostingPlugin(
      'stoat_auto_hosting',
      stoatConfig.plugins?.auto_hosting as AutoHostingPlugin,
      githubActionRun,
      stoatConfigFileId
    );
  }
};
