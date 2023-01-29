import * as core from '@actions/core';
import fs from 'fs';

import {
  UploadGenericPartialConfigRequest,
  WorkflowDispatchPlugin,
  WorkflowDispatchPluginRendered
} from '../../../../types/src';
import { GithubActionRun } from '../../types';
import { submitPartialConfig } from '../helpers';

const runWorkflowDispatchPlugin = async (
  taskId: string,
  taskConfig: WorkflowDispatchPlugin,
  { ghToken, ghRepository: { owner, repo }, ghBranch, ghPullRequestNumber, ghSha }: GithubActionRun,
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
  const workflowDefinition = fs.readFileSync(workflowFilePath).toString();

  const renderedPlugin: WorkflowDispatchPluginRendered = {
    ...taskConfig,
    definition: workflowDefinition
  };
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner: owner,
    ghRepo: repo,
    ghSha,
    ghToken,
    ghBranch,
    ghPullRequestNumber,
    taskId,
    stoatConfigFileId,
    partialConfig: {
      plugins: {
        workflow_dispatch: { [taskId]: renderedPlugin }
      }
    }
  };
  await submitPartialConfig(taskId, requestBody);
};

export default runWorkflowDispatchPlugin;
