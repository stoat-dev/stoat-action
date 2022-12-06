import { StaticHostingPlugin } from '../../schemas/stoatConfigSchema';
import { GithubActionRun } from '../../types';
declare const runStaticHostingPlugin: (taskId: string, taskConfig: StaticHostingPlugin, { ghToken, ghRepository: { repo, owner }, ghSha }: GithubActionRun, stoatConfigFileId: number) => Promise<void>;
export default runStaticHostingPlugin;
