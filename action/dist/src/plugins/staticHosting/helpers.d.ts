import { CreateSignedUrlRequest, CreateSignedUrlResponse } from '../../types';
export declare const createSignedUrl: (request: CreateSignedUrlRequest) => Promise<CreateSignedUrlResponse>;
export declare const uploadFileWithSignedUrl: (signedUrl: string, fields: Record<string, string>, objectKey: string, localFilePath: string, dryRun?: boolean) => Promise<void>;
export declare const uploadDirectory: (signedUrl: string, fields: Record<string, string>, localPathToUpload: string, targetDirectory: string, dryRun?: boolean) => Promise<void>;
