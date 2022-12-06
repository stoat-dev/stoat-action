import { StoatConfigSchema } from '../schemas/stoatConfigSchema';
import { GithubActionRun } from '../types';
export declare const runPlugins: (stoatConfig: StoatConfigSchema, githubActionRun: GithubActionRun, stoatConfigFileId: number) => Promise<void>;
