import { JobRuntimePlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
declare const runJobRuntimePlugin: (taskId: string, taskConfig: JobRuntimePlugin, { ghToken, ghWorkflow, ghRepository: { repo, owner }, ghSha, ghJob }: GithubActionRun, stoatConfigFileId: number) => Promise<void>;
export default runJobRuntimePlugin;
