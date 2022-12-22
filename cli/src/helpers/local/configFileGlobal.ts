import chalk from 'chalk';
import fs, {FSWatcher, readFileSync, WatchEventType} from 'fs';
import { getTypedStoatConfig, readStoatConfig } from '../../../../action/src/configHelpers';
import { StoatConfigSchema } from '../../../../action/src/schemas/stoatConfigSchema';
import {
  getRemoteDefaultTemplate,
  getTemplateFormat
} from '../../../../action/src/templateHelpers';
import { Template } from '../../../../action/src/types';

import {findGitRoot, findStoatConfigPath} from '../pathHelpers';
import path from "path";

// supports reading the local template from a subdirectory
const getLocalTemplate = (commentTemplatePath: string): Template => {
  const gitRoot = findGitRoot(process.cwd());
  const fullCommentTemplateFile = path.join(gitRoot, commentTemplatePath);
  const template = readFileSync(fullCommentTemplateFile).toString().trim();
  const format = getTemplateFormat(fullCommentTemplateFile);
  return { template, format };
};

// supports reading the local template from a subdirectory if necessary
const getTemplate = async (
    ghOwner: string,
    ghRepo: string,
    stoatConfig: StoatConfigSchema
): Promise<Template> => {
  const { comment_template_file } = stoatConfig;
  if (comment_template_file === undefined || comment_template_file === '') {
    return getRemoteDefaultTemplate(ghOwner, ghRepo, stoatConfig);
  }
  return getLocalTemplate(comment_template_file);
};

interface TemplateWatcher {
  commentTemplateFile: string;
  fileWatcher: FSWatcher | undefined;
}

const getTemplateWatcher = async (oldTemplateWatcher: TemplateWatcher, commentTemplateFile: string): Promise<TemplateWatcher> => {
  if(oldTemplateWatcher !== undefined) {
    if(oldTemplateWatcher.commentTemplateFile === commentTemplateFile) {
      return oldTemplateWatcher;
    } else {
      oldTemplateWatcher.fileWatcher?.close();
    }
  }

  if(commentTemplateFile === undefined || commentTemplateFile === '') {
    return {
      commentTemplateFile: commentTemplateFile,
      fileWatcher: undefined
    };
  }

  const gitRoot = findGitRoot(process.cwd());
  const absolutePath = path.join(gitRoot, commentTemplateFile);
  const fileWatcher = fs.watch(absolutePath, async (eventType: WatchEventType) => {
    if (eventType === 'change') {
      try {
        await ConfigFileGlobal.update();
      } catch (e) {
        // do nothing
      }
    }
  });

  return {
    commentTemplateFile: commentTemplateFile,
    fileWatcher: fileWatcher
  };
};

export default class ConfigFileGlobal {
  private static schema: StoatConfigSchema | undefined;
  private static template: Template | undefined;
  private static templateWatcher: TemplateWatcher;

  static async update() {
    const configFilePath = findStoatConfigPath(process.cwd());
    const stoatConfig = readStoatConfig(configFilePath);
    this.schema = await getTypedStoatConfig(stoatConfig);
    this.template = await getTemplate('', '', this.schema);
    this.templateWatcher = await getTemplateWatcher(this.templateWatcher, stoatConfig.comment_template_file);
  }

  static getSchema() {
    return this.schema;
  }

  static getTemplate() {
    return this.template;
  }

  static async initialize() {
    const configPath = findStoatConfigPath(process.cwd());

    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Stoat config file does not exist for this repo. Try running: stoat init'));
      process.exit(1);
    }

    try {
      await ConfigFileGlobal.update();
    } catch (e) {
      // do nothing
    }

    fs.watch(configPath, async (eventType, filename) => {
      if (eventType === 'change') {
        try {
          await ConfigFileGlobal.update();
        } catch (e) {
          // do nothing
        }
      }
    });
  }
}
