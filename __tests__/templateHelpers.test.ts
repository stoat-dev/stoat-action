import { describe, expect, test } from '@jest/globals';

import { JsonPlugin, StaticHostingPlugin, StoatConfigSchema } from '../src/schemas/stoatConfigSchema';
import {
  getLocalTemplate,
  getPluginTypes,
  getRemoteDefaultTemplate,
  getTemplate,
  getTemplateFormat
} from '../src/templateHelpers';
import { PluginType, TemplateFormat } from '../src/types';

const ghOwner = 'test-owner';
const ghRepo = 'test-repo';

const template1Path = '__tests__/templates/template1.hbs';
const template1 = 'template1';
const template2Path = '__tests__/templates/template2.jinja2';
const template2 = 'template2';

const staticHosting1: StaticHostingPlugin = {
  static_hosting: {
    path: 'path1'
  }
};
const staticHosting2: StaticHostingPlugin = {
  static_hosting: {
    path: 'path2'
  }
};
const json1: JsonPlugin = {
  json: {
    path: 'path1'
  }
};

describe('Read local template', () => {
  test('getTemplate', async () => {
    expect(
      await getTemplate(ghOwner, ghRepo, {
        version: 1,
        comment_template: template1Path
      })
    ).toEqual({
      format: TemplateFormat.Handlebars,
      template: template1
    });

    expect(
      await getTemplate(ghOwner, ghRepo, {
        version: 1,
        comment_template: template2Path
      })
    ).toEqual({
      format: TemplateFormat.Jinja2,
      template: template2
    });
  });

  test('getLocalTemplate', () => {
    expect(getLocalTemplate(template1Path)).toEqual({ template: template1, format: TemplateFormat.Handlebars });
    expect(getLocalTemplate(template2Path)).toEqual({ template: template2, format: TemplateFormat.Jinja2 });
  });
});

/**
 * This test calls the remote server.
 */
describe('Read remote default template', () => {
  const stoatConfigWithoutPlugin: StoatConfigSchema = {
    version: 1
  };
  const stoatConfigWithOnePlugin: StoatConfigSchema = {
    version: 1,
    plugins: {
      plugin1: staticHosting1
    }
  };
  const stoatConfigWithMultiPlugins: StoatConfigSchema = {
    version: 1,
    plugins: {
      plugin1: staticHosting1,
      plugin2: staticHosting2
    }
  };

  test('getTemplate', async () => {
    expect(await getTemplate(ghOwner, ghRepo, stoatConfigWithoutPlugin)).toBeDefined();
    expect(await getTemplate(ghOwner, ghRepo, stoatConfigWithOnePlugin)).toBeDefined();
    expect(await getTemplate(ghOwner, ghRepo, stoatConfigWithMultiPlugins)).toBeDefined();
  });

  test('getRemoteDefaultTemplate', async () => {
    expect(await getRemoteDefaultTemplate(ghOwner, ghRepo, stoatConfigWithoutPlugin)).toBeDefined();
    expect(await getRemoteDefaultTemplate(ghOwner, ghRepo, stoatConfigWithOnePlugin)).toBeDefined();
    expect(await getRemoteDefaultTemplate(ghOwner, ghRepo, stoatConfigWithMultiPlugins)).toBeDefined();
  });
});

test('getTemplateFormat', () => {
  expect(getTemplateFormat(template1Path)).toEqual(TemplateFormat.Handlebars);
  expect(getTemplateFormat(template2Path)).toEqual(TemplateFormat.Jinja2);
});

describe('getPluginTypes', () => {
  test('Single plugin', () => {
    expect(
      getPluginTypes({
        version: 1,
        plugins: {
          plugin1: staticHosting1
        }
      })
    ).toEqual([PluginType.StaticHosting]);
  });

  test('Multiple plugins', () => {
    expect(
      getPluginTypes({
        version: 1,
        plugins: {
          plugin1: staticHosting1,
          plugin2: staticHosting2,
          plugin3: json1
        }
      }).sort()
    ).toEqual([PluginType.Json, PluginType.StaticHosting].sort());
  });
});
