import * as core from '@actions/core';

import { GithubActionRun, UploadJobRuntimeRequest } from '../../types';
import { submitPartialConfig } from '../helpers';

const runJobRuntimePlugin = async (
  taskId: string,
  { ghToken, ghRepository: { repo, owner }, ghSha, ghJobs }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);

  for (const ghJob of ghJobs) {
    const runtimeSeconds = Math.floor(new Date().valueOf() - new Date(ghJob.started_at).valueOf()) / 1000;
    core.info(`[${taskId}] Uploading job runtime for ${ghJob.name}: ${runtimeSeconds}`);
    const requestBody: UploadJobRuntimeRequest = {
      ghSha,
      taskId,
      stoatConfigFileId,
      ghToken,
      ghJobName: ghJob.name,
      runtimeSeconds
    };
    await submitPartialConfig<UploadJobRuntimeRequest>(taskId, 'job_runtimes', requestBody);
  }
};

export default runJobRuntimePlugin;
