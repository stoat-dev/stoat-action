import { GitHub } from '@actions/github/lib/utils';
import { Repository } from './types';
export declare function getCurrentPullRequestNumber(octokit: InstanceType<typeof GitHub>, repository: Repository, sha: string): Promise<number | null>;
