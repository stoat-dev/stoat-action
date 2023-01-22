import * as core from '@actions/core';
import fs from 'fs';

import { WorkflowDispatchPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun, UploadWorkflowDispatchRequest } from '../../types';
import { submitPartialConfig } from '../helpers';

const runWorkflowDispatchPlugin = async (
  taskId: string,
  taskConfig: WorkflowDispatchPlugin,
  githubActionRun: GithubActionRun,
  stoatConfigFileId: number
) => {
  core.info(`[${taskId}] Running workflow dispatch plugin (stoat config ${stoatConfigFileId})`);

  const workflowFilename = taskConfig.filename;
  if (!workflowFilename) {
    const message = `[${taskId}] Workflow filename is missing, please specify a filename in the "workflow_filename" field`;
    core.error(message);
    return;
  }

  const workflowFilePath = `.github/workflows/${workflowFilename}`;
  if (!fs.existsSync(workflowFilePath)) {
    const message = `[${taskId}] Workflow file does not exist: ${workflowFilePath}`;
    core.error(message);
    return;
  }
  const workflow = fs.readFileSync(workflowFilename).toString();

  const requestBody: UploadWorkflowDispatchRequest = {
    ghOwner: githubActionRun.ghRepository.owner,
    ghRepo: githubActionRun.ghRepository.repo,
    ghSha: githubActionRun.ghSha,
    ghToken: githubActionRun.ghToken,
    taskId,
    stoatConfigFileId,
    workflow
  };
  await submitPartialConfig<UploadWorkflowDispatchRequest>(taskId, 'workflow-dispatches', requestBody);
};

export default runWorkflowDispatchPlugin;
