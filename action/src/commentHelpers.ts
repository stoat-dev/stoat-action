import * as core from '@actions/core';
import fetch from 'cross-fetch';

import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import { getApiUrlBase } from './stoatApiHelpers';
import { GithubActionRun, Template, UpdateWorkflowOutputRequest, UpdateWorkflowOutputResponse } from './types';

export const uploadWorkflowOutputs = async (
  stoatConfig: StoatConfigSchema,
  commentTemplate: Template,
  {
    ghRepository: { owner, repo },
    ghBranch,
    ghPullRequestNumber,
    ghWorkflow,
    ghSha,
    ghCommitTimestamp,
    ghRunId,
    ghRunNumber,
    ghRunAttempt,
    ghToken
  }: GithubActionRun
): Promise<number> => {
  const params: UpdateWorkflowOutputRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghBranch,
    ghPullRequestNumber,
    ghWorkflow,
    ghSha,
    ghCommitTimestamp: ghCommitTimestamp.toISOString(),
    ghRunId,
    ghRunNumber,
    ghRunAttempt,
    stoatConfig,
    commentTemplateFile: commentTemplate.template,
    ghToken
  };
  const url = `${await getApiUrlBase(owner, repo)}/api/workflow_outputs`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    core.error(
      `Failed to upload workflow outputs (${response.status} ${response.statusText}): ${await response.text()}`
    );
    throw new Error();
  }

  const { stoatConfigFileId } = (await response.json()) as UpdateWorkflowOutputResponse;
  core.info(`Uploaded workflow outputs (stoat config ${stoatConfigFileId})!`);
  return stoatConfigFileId;
};
