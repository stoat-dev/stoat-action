// this doesn't use the gh prefix since it's used to interact with the github context
export interface Repository {
  owner: string;
  repo: string;
}

export type GithubActionRun = {
  ghRepository: Repository;
  ghBranch: string;
  ghPullRequestNumber: number | null;
  ghWorkflow: string;
  ghSha: string;
  ghCommitTimestamp: Date;
  ghRunId: number;
  ghRunNumber: number;
  ghRunAttempt: number;
  ghToken: string;
};

// These types are copied from site/src/api/types.ts. In the future, they should be moved to a package.
export type UploadWorkflowOutputRequest = {
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
  pluginId: string;
};

export type CreateSignedUrlResponse = {
  signedUrl: string;
  fields: Record<string, string>;
  objectPath: string;
  hostingUrl: string;
};

export type UploadStaticHostingRequest = {
  ghSha: string;
  pluginId: string;
  stoatConfigFileId: number;
  hostingUrl: string;
  ghToken: string;
};

export type UploadStaticHostingResponse = {
  partialConfigId: number;
};
