import { UploadPartialConfigRequest } from '../types';
export declare const submitPartialConfig: <T extends UploadPartialConfigRequest>(taskId: string, apiSuffix: string, requestBody: T) => Promise<void>;
