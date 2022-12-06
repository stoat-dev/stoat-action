import { StoatConfigSchema } from './schemas/stoatConfigSchema';
export declare function readStoatConfig(configFilePath?: string): any;
export declare function getTypedStoatConfig(stoatConfig: any): Promise<StoatConfigSchema>;
