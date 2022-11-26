import * as core from '@actions/core';
import fetch from 'cross-fetch';
import { readFileSync } from 'fs';

import { StoatConfigSchema } from './schemas/stoatConfigSchema';
import { API_URL_BASE } from './stoatApiHelpers';
import { GetDefaultTemplateRequest, GetDefaultTemplateResponse, PluginType, Template, TemplateFormat } from './types';

export const getTemplate = async (
  ghOwner: string,
  ghRepo: string,
  stoatConfig: StoatConfigSchema
): Promise<Template> => {
  const { comment_template } = stoatConfig;
  if (comment_template === undefined || comment_template === '') {
    return getRemoteDefaultTemplate(ghOwner, ghRepo, stoatConfig);
  }
  return getLocalTemplate(comment_template);
};

export const getLocalTemplate = (commentTemplatePath: string): Template => {
  const template = readFileSync(commentTemplatePath).toString().trim();
  const format = getTemplateFormat(commentTemplatePath);
  return { template, format };
};

export const getTemplateFormat = (commentTemplatePath: string): TemplateFormat => {
  const pathTokens = commentTemplatePath.split('.');
  const extension = pathTokens[pathTokens.length - 1];
  for (const format of Object.values(TemplateFormat)) {
    if (format === extension) {
      return format;
    }
  }
  throw new Error(`Unknown template format: ${commentTemplatePath}`);
};

export const getRemoteDefaultTemplate = async (
  ghOwner: string,
  ghRepo: string,
  stoatConfig: StoatConfigSchema
): Promise<Template> => {
  const params: GetDefaultTemplateRequest = {
    ghOwner,
    ghRepo,
    stoatConfigVersion: String(stoatConfig.version),
    pluginTypes: getPluginTypes(stoatConfig)
  };
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        urlParams.append(key, item);
      }
    } else {
      urlParams.append(key, value);
    }
  }
  const url = `${API_URL_BASE}/api/templates?${urlParams.toString()}`;
  core.info(`Fetching default template from ${url}`);
  const response = await fetch(url, {
    method: 'GET'
  });

  if (!response.ok) {
    throw Error(`Failed to get default template: ${response.status} - ${response.statusText}`);
  }

  const { template, format } = (await response.json()) as GetDefaultTemplateResponse;
  core.info(`Got default template (format ${format}):\n${template}`);
  return { template, format };
};

export const getPluginTypes = (stoatConfig: StoatConfigSchema): PluginType[] => {
  if (!stoatConfig.plugins) {
    return [];
  }
  const pluginTypes: Set<PluginType> = new Set<PluginType>();
  for (const plugin of Object.values(stoatConfig.plugins)) {
    if ('static_hosting' in plugin) {
      pluginTypes.add(PluginType.StaticHosting);
    }
    if ('json' in plugin) {
      pluginTypes.add(PluginType.Json);
    }
  }
  return Array.from(pluginTypes);
};
