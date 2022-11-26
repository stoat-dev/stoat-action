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

// These types are copied from src/common/types.ts.
export enum PluginType {
  StaticHosting = 'static_hosting',
  Json = 'json'
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

export type UploadJsonRequest = {
  ghSha: string;
  pluginId: string;
  stoatConfigFileId: number;
  value: object;
  ghToken: string;
};

export type UploadJsonResponse = {
  partialConfigId: number;
};

export type GetDefaultTemplateRequest = {
  /* params for API validation */
  ghOwner: string;
  ghRepo: string;

  /* params for template retrieval */
  // the version is sent as a query param,
  // so it is typed as string instead of number
  stoatConfigVersion: string;
  pluginTypes?: PluginType | PluginType[];
};

export type GetDefaultTemplateResponse = {
  stoatConfigVersion: number;
  template: string;
  format: TemplateFormat;
  pluginTypes: PluginType[];
};
