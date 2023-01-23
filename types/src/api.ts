import { StoatPlugin } from "./plugin";
import { StoatConfigSchemaRendered } from "./schemas";
import { StoatTemplateFormat } from "./template";

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

export interface UploadGenericPartialConfigRequest
  extends UploadPartialConfigRequest {
  partialConfig: Pick<StoatConfigSchemaRendered, "plugins">;
}

export type GetDefaultTemplateRequest = {
  /* params for API validation */
  ghOwner: string;
  ghRepo: string;

  /* params for template retrieval */
  // the version is sent as a query param,
  // so it is typed as string instead of number
  stoatConfigVersion: string;
  plugins?: StoatPlugin | StoatPlugin[];
};

export type GetDefaultTemplateResponse = {
  stoatConfigVersion: number;
  template: string;
  format: StoatTemplateFormat;
  plugins: StoatPlugin[];
};
