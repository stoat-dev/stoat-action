import { describe, expect, test } from '@jest/globals';

import { ImageDiffPlugin, JsonPlugin, StaticHostingPlugin, StoatConfigSchema } from '../src/schemas';
import {
  getLocalTemplate,
  getPlugins,
  getRemoteDefaultTemplate,
  getTemplate,
  getTemplateFormat
} from '../src/templateHelpers';
import { Plugin, TemplateFormat } from '../src/types';

const ghOwner = 'test-owner';
const ghRepo = 'test-repo';

const template1Path = '__tests__/templates/template1.hbs';
const template1 = 'template1';
const template2Path = '__tests__/templates/template2.jinja2';
const template2 = 'template2';

const staticHosting1: StaticHostingPlugin = {
  path: 'path1'
};
const staticHosting2: StaticHostingPlugin = {
  path: 'path2'
};
const json1: JsonPlugin = {
  path: 'path1'
};
const imageDiff1: ImageDiffPlugin = {
  image: 'path1',
  baseline: 'baseline1'
};

describe('Read local template', () => {
  test('getTemplate', async () => {
    expect(
      await getTemplate(ghOwner, ghRepo, {
        version: 1,
        comment_template_file: template1Path
      })
    ).toEqual({
      format: TemplateFormat.Handlebars,
      template: template1
    });

    expect(
      await getTemplate(ghOwner, ghRepo, {
        version: 1,
        comment_template_file: template2Path
      })
    ).toEqual({
      format: TemplateFormat.Jinja2,
      template: template2
    });
  });

  test('getLocalTemplate', () => {
    expect(getLocalTemplate(template1Path)).toEqual({
      template: template1,
      format: TemplateFormat.Handlebars
    });
    expect(getLocalTemplate(template2Path)).toEqual({
      template: template2,
      format: TemplateFormat.Jinja2
    });
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
      static_hosting: { plugin1: staticHosting1 }
    }
  };
  const stoatConfigWithMultiPlugins: StoatConfigSchema = {
    version: 1,
    plugins: {
      static_hosting: { plugin1: staticHosting1, plugin2: staticHosting2 }
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
  expect(() => getTemplateFormat('template.xlsx')).toThrowError();
});

describe('getPlugins', () => {
  test('Single plugin', () => {
    expect(
      getPlugins({
        version: 1,
        plugins: {
          static_hosting: { plugin1: staticHosting1 }
        }
      })
    ).toEqual([Plugin.StaticHosting]);
  });

  test('Multiple plugins', () => {
    expect(
      getPlugins({
        version: 1,
        plugins: {
          static_hosting: { plugin1: staticHosting1, plugin2: staticHosting2 },
          json: { plugin3: json1 },
          image_diff: { plugin4: imageDiff1 }
        }
      }).sort()
    ).toEqual([Plugin.Json, Plugin.StaticHosting, Plugin.ImageDiff].sort());
  });
});
