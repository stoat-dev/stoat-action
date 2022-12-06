import { JsonPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
declare const runJsonPlugin: (taskId: string, taskConfig: JsonPlugin, { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun, stoatConfigFileId: number) => Promise<void>;
export default runJsonPlugin;
