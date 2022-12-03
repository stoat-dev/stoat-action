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

  const runtimeSeconds = Math.floor(new Date().valueOf() - new Date(ghJob.started_at).valueOf() / 1000);
  core.info(`[${taskId}] Uploading job runtime for ${ghJob.name}: ${runtimeSeconds}`);
  const requestBody: UploadJobRuntimeRequest = {
    ghSha,
    taskId,
    stoatConfigFileId,
    ghToken,
    ghWorkflow,
    ghJob: ghJob.name,
    runtimeSeconds
  };
  await submitPartialConfig<UploadJobRuntimeRequest>(taskId, 'job_runtimes', requestBody);
};

export default runJobRuntimePlugin;
