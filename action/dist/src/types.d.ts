import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { ValuesType } from 'utility-types';
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
};
export declare enum Plugin {
    StaticHosting = "static_hosting",
    Json = "json"
}
export declare enum TemplateFormat {
    Handlebars = "hbs",
    Jinja2 = "jinja2"
}
export interface Template {
    format: TemplateFormat;
    template: string;
}
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
};
export type CreateSignedUrlResponse = {
    signedUrl: string;
    fields: Record<string, string>;
    objectPath: string;
    hostingUrl: string;
};
export interface UploadPartialConfigRequest {
    ghSha: string;
    taskId: string;
    stoatConfigFileId: number;
    ghToken: string;
}
export interface UploadPartialConfigResponse {
    partialConfigId: number;
}
export interface UploadStaticHostingRequest extends UploadPartialConfigRequest {
    hostingUrl: string;
}
export interface UploadJsonRequest extends UploadPartialConfigRequest {
    value: object;
}
export interface UploadJobRuntimeRequest extends UploadPartialConfigRequest {
    ghWorkflow: string;
    ghJob: string;
    runtimeSeconds: number;
    width?: number;
    height?: number;
}
export type GetDefaultTemplateRequest = {
    ghOwner: string;
    ghRepo: string;
    stoatConfigVersion: string;
    plugins?: Plugin | Plugin[];
};
export type GetDefaultTemplateResponse = {
    stoatConfigVersion: number;
    template: string;
    format: TemplateFormat;
    plugins: Plugin[];
};
export {};
