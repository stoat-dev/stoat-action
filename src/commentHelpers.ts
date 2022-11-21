import * as core from '@actions/core';

import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import { API_URL_BASE } from './stoatApiHelpers';
import { GithubActionRun, UpdateCommentResponse, UploadWorkflowOutputRequest } from './types';

export const uploadWorkflowOutputs = async (
  stoatConfig: StoatConfigSchema,
  commentTemplateFile: string,
  {
    ghRepository,
    ghBranch,
    ghPullRequestNumber,
    ghWorkflow,
    ghSha,
    ghCommitTimestamp,
    ghRunId,
    ghRunNumber,
    ghRunAttempt
  }: GithubActionRun
): Promise<number> => {
  const params: UploadWorkflowOutputRequest = {
    ghOwner: ghRepository.owner,
    ghRepo: ghRepository.repo,
    ghBranch,
    ghPullRequestNumber,
    ghWorkflow,
    ghSha,
    ghCommitTimestamp: ghCommitTimestamp.toISOString(),
    ghRunId,
    ghRunNumber,
    ghRunAttempt,
    stoatConfig,
    commentTemplateFile
  };
  const url = `${API_URL_BASE}/api/workflow_outputs`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw Error('Request to update comment failed!');
  }

  const { stoatConfigFileId } = (await response.json()) as UpdateCommentResponse;
  core.info(`Uploaded workflow outputs (stoat config ${stoatConfigFileId})!`);
  return stoatConfigFileId;
};
