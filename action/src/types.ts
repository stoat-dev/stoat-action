import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { ValuesType } from 'utility-types';

import { StoatConfigSchemaRendered } from './schemas/stoatConfigSchemaRendered';

// this doesn't use the gh prefix since it's used to interact with the github context
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

// These types are copied from src/common/types.ts.
export enum Plugin {
  StaticHosting = 'static_hosting',
  Json = 'json',
  ImageDiff = 'image_diff',
  JobRuntime = 'job_runtime',
  WorkflowDispatch = 'workflow_dispatch'
}

export enum TemplateFormat {
  Handlebars = 'hbs',
  Jinja2 = 'jinja2'
}

export interface Template {
  format: TemplateFormat;
  template: string;
}

// These types are copied from site/src/api/types.ts.
export type UpdateWorkflowOutputRequest = {
  ghOwner: string;
  ghRepo: string;
  ghBranch: string;
  ghPullRequestNumber: number | null;
  ghWorkflow: string;
  ghSha: string;
  ghCommitTimestamp: string;
  ghRunId: number;
  ghRunNumber: number;
  ghRunAttempt: number;
  stoatConfig: object;
  commentTemplateFile: string;
  ghToken: string;
};

export type UpdateWorkflowOutputResponse = {
  stoatConfigFileId: number;
};

export type CreateSignedUrlRequest = {
  ghOwner: string;
  ghRepo: string;
  ghSha: string;
  ghToken: string;
  taskId: string;
  filename?: string;
};

export type CreateSignedUrlResponse = {
  signedUrl: string;
  fields: Record<string, string>;
  objectPath: string;
  hostingUrl: string;
};

export interface UploadPartialConfigRequest {
  ghOwner: string;
  ghRepo: string;
  ghSha: string;
  taskId: string;
  stoatConfigFileId: number;
  ghToken: string;
}

export interface UploadPartialConfigResponse {
  partialConfigId: number;
}

export interface UploadGenericPartialConfigRequest extends UploadPartialConfigRequest {
  partialConfig: Pick<StoatConfigSchemaRendered, 'plugins'>;
}

export interface UploadStaticHostingRequest extends UploadPartialConfigRequest {
  hostingUrl: string;
  status: string;
}

export interface UploadJsonRequest extends UploadPartialConfigRequest {
  value: object;
}

export interface UploadImageDiffRequest extends UploadPartialConfigRequest {
  imageUrl: string;
  baselineUrl: string;
  diffUrl: string;
}

export interface UploadJobRuntimeRequest extends UploadPartialConfigRequest {
  ghWorkflow: string;
  ghJob: string;
  runtimeSeconds: number;
  width?: number;
  height?: number;
}

export type GetDefaultTemplateRequest = {
  /* params for API validation */
  ghOwner: string;
  ghRepo: string;

  /* params for template retrieval */
  // the version is sent as a query param,
  // so it is typed as string instead of number
  stoatConfigVersion: string;
  plugins?: Plugin | Plugin[];
};

export type GetDefaultTemplateResponse = {
  stoatConfigVersion: number;
  template: string;
  format: TemplateFormat;
  plugins: Plugin[];
};
