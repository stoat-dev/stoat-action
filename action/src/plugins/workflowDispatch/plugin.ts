import * as core from '@actions/core';
import fs from 'fs';

import { WorkflowDispatchPlugin } from '../../schemas/stoatConfigSchema';
import { WorkflowDispatchPluginRendered } from '../../schemas/stoatConfigSchemaRendered';
import { GithubActionRun, UploadGenericPartialConfigRequest } from '../../types';
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
  const workflowDefinition = fs.readFileSync(workflowFilename).toString();

  const renderedPlugin: WorkflowDispatchPluginRendered = {
    ...taskConfig,
    workflow_definition: workflowDefinition
  };
  const requestBody: UploadGenericPartialConfigRequest = {
    ghOwner: githubActionRun.ghRepository.owner,
    ghRepo: githubActionRun.ghRepository.repo,
    ghSha: githubActionRun.ghSha,
    ghToken: githubActionRun.ghToken,
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
