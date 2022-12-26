import * as core from '@actions/core';

import { JobRuntimePlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun, UploadJobRuntimeRequest } from '../../types';
import { submitPartialConfig } from '../helpers';

const runJobRuntimePlugin = async (
  taskId: string,
  taskConfig: JobRuntimePlugin,
  { ghToken, ghWorkflow, ghRepository: { repo, owner }, ghSha, ghJob }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);

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
  const requestBody: UploadJobRuntimeRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    taskId,
    stoatConfigFileId,
    ghWorkflow,
    ghJob: ghJob.name,
    runtimeSeconds
  };
  await submitPartialConfig<UploadJobRuntimeRequest>(taskId, 'job_runtimes', requestBody);
};

export default runJobRuntimePlugin;
