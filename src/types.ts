// These types are copied from site/src/api/types.ts. In the future, they should be moved to a package.

// this doesn't use the gh prefix since it's used to interact with the github context
export interface Repository {
  owner: string;
  repo: string;
}

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

export type UpdateCommentResponse = {
  stoatConfigFileId: number;
};

export type GetSurgeCredentialRequest = {
  stoatConfigFileId: string;
  ghToken: string;
};

export type GetSurgeCredentialResponse = {
  surgeLogin: string;
  surgeToken: string;
};

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

export type UploadStaticHostingRequest = {
  ghSha: string;
  pluginId: string;
  stoatConfigFileId: number;
  uploadUrl: string;
  ghToken: string;
};

export type UploadStaticHostingResponse = {
  partialConfigId: number;
};
