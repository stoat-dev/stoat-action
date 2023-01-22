import * as core from '@actions/core';

import { JobRuntimePlugin, JobRuntimePluginRendered } from '../../schemas';
import { GithubActionRun, UploadGenericPartialConfigRequest } from '../../types';
import { submitPartialConfig } from '../helpers';

const runJobRuntimePlugin = async (
  taskId: string,
  taskConfig: JobRuntimePlugin,
  { ghToken, ghWorkflow, ghRepository: { repo, owner }, ghSha, ghJob }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running job runtime plugin (stoat config ${stoatConfigFileId})`);

  if (!ghJob) {
    core.warning(`[${taskId}] No job information found for job run`);
    return;
  }

  const startedAt = new Date(ghJob.started_at);
  const now = new Date();
  const runtimeSeconds = Math.floor((now.valueOf() - startedAt.valueOf()) / 1000);
  core.info(
    `[${taskId}] Uploading job runtime for ${ghJob.name}: ` +
      `${runtimeSeconds} (${startedAt.toISOString()} - ${now.toISOString()})`
  );
  const renderedPlugin: JobRuntimePluginRendered = {
    ...taskConfig,
    runtime: [
      {
        sha: ghSha,
        workflow: ghWorkflow,
        job: ghJob.name,
        runtime_seconds: runtimeSeconds
      }
    ]
  };
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    partialConfig: {
      plugins: {
        job_runtime: renderedPlugin
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
};

export default runJobRuntimePlugin;
