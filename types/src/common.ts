import {
  RestEndpointMethodTypes
} from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";
import { ValuesType } from "utility-types";

export interface Repository {
  owner: string;
  repo: string;
}

type GithubJobs = RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data']['jobs'];
export type GithubJob = ValuesType<GithubJobs>;

export type GithubActionRun = {
  ghRepository: Repository;
  ghBranch: string;
  ghPullRequestNumber: number | null;
  ghWorkflow: string;
  ghJob?: GithubJob;
  ghSha: string;
  ghCommitTimestamp: Date;
  ghRunId: number;
  ghRunNumber: number;
  ghRunAttempt: number;
  ghToken: string;
  stepsSucceeded: boolean;
};
