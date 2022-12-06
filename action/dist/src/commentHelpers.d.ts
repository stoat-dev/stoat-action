import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import { GithubActionRun, Template } from './types';
export declare const uploadWorkflowOutputs: (stoatConfig: StoatConfigSchema, commentTemplate: Template, { ghRepository, ghBranch, ghPullRequestNumber, ghWorkflow, ghSha, ghCommitTimestamp, ghRunId, ghRunNumber, ghRunAttempt, ghToken }: GithubActionRun) => Promise<number>;
