import * as core from '@actions/core';
import fetch from 'cross-fetch';
import { readFileSync } from 'fs';

import {
  GetDefaultTemplateRequest,
  GetDefaultTemplateResponse,
  StoatConfigSchema,
  StoatPlugin,
  StoatTemplate,
  StoatTemplateFormat
} from '../../types';
import { getApiUrlBase } from './stoatApiHelpers';

export const getTemplate = async (
  ghOwner: string,
  ghRepo: string,
  stoatConfig: StoatConfigSchema
): Promise<StoatTemplate> => {
  const { comment_template_file } = stoatConfig;
  if (comment_template_file === undefined || comment_template_file === '') {
    return getRemoteDefaultTemplate(ghOwner, ghRepo, stoatConfig);
  }
  return getLocalTemplate(comment_template_file);
};

export const getLocalTemplate = (commentTemplatePath: string): StoatTemplate => {
  const template = readFileSync(commentTemplatePath).toString().trim();
  const format = getTemplateFormat(commentTemplatePath);
  return { template, format };
};

export const getTemplateFormat = (commentTemplatePath: string): StoatTemplateFormat => {
  const pathTokens = commentTemplatePath.split('.');
  const extension = pathTokens[pathTokens.length - 1];
  for (const format of Object.values(StoatTemplateFormat)) {
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
): Promise<StoatTemplate> => {
  const params: GetDefaultTemplateRequest = {
    ghOwner,
    ghRepo,
    stoatConfigVersion: String(stoatConfig.version),
    plugins: getPlugins(stoatConfig)
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
  const url = `${await getApiUrlBase(ghOwner, ghRepo)}/api/templates?${urlParams.toString()}`;
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

export const getPlugins = (stoatConfig: StoatConfigSchema): StoatPlugin[] => {
  const plugins: Set<StoatPlugin> = new Set<StoatPlugin>();
  for (const [pluginField, pluginValue] of Object.entries(stoatConfig.plugins || {})) {
    if (Object.keys(pluginValue || {}).length > 0) {
      for (const pluginName of Object.values(StoatPlugin)) {
        if (pluginField === pluginName) {
          plugins.add(pluginName);
        }
      }
    }
  }
  return Array.from(plugins);
};
