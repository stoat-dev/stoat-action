import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import { Plugin, Template, TemplateFormat } from './types';
export declare const getTemplate: (ghOwner: string, ghRepo: string, stoatConfig: StoatConfigSchema) => Promise<Template>;
export declare const getLocalTemplate: (commentTemplatePath: string) => Template;
export declare const getTemplateFormat: (commentTemplatePath: string) => TemplateFormat;
export declare const getRemoteDefaultTemplate: (ghOwner: string, ghRepo: string, stoatConfig: StoatConfigSchema) => Promise<Template>;
export declare const getPlugins: (stoatConfig: StoatConfigSchema) => Plugin[];
