import * as core from '@actions/core';

import { GithubActionRun, UploadJobRuntimeRequest } from '../../types';

const runJobRuntimePlugin = async (
  taskId: string,
  { ghToken, ghRepository: { repo, owner }, ghSha, ghJobs }: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running static hosting plugin (stoat config ${stoatConfigFileId})`);

  for (const ghJob of ghJobs) {
    core.info(`[${taskId}] Uploading job runtime for ${ghJob.name}: ${JSON.stringify(ghJob)}`);
    const requestBody: UploadJobRuntimeRequest = {
      ghSha,
      taskId,
      stoatConfigFileId,
      ghToken,
      ghJobName: ghJob.name,
      runtimeSeconds: 0
    };
    // await submitPartialConfig<UploadJobRuntimeRequest>(taskId, 'job_runtimes', requestBody);
  }
};

export default runJobRuntimePlugin;
