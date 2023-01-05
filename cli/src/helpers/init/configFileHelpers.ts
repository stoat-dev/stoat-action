import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import { findStoatConfigPath, getGitRoot } from '../pathHelpers';
import { GhJob } from './stoatActionHelpers';

const defaultStoatConfigFile =
  `
---
version: 1
enabled: true
plugins:
  job_runtime:
    enabled: true
#  static_hosting:
#    your_unique_id:
#      metadata:
#        name: "Name of artifact you're hosting, such as Code Coverage Report"
#      path: path/from/git/root/to/directory/to/host
`.trim() + '\n';

export function createConfigFile() {
  const configFilePath = findStoatConfigPath(process.cwd());

  if (fs.existsSync(configFilePath)) {
    console.warn(chalk.yellow(`Stoat config file already exists: ${configFilePath}`));
  } else {
    const stoatDirectory = path.join(getGitRoot(), '.stoat');
    if (!fs.existsSync(stoatDirectory)) {
      fs.mkdirSync(stoatDirectory);
    }

    fs.writeFileSync(configFilePath, defaultStoatConfigFile);
    console.log(`Stoat config file created at: ${configFilePath}`);
  }
}

export function addStoatActionToYaml(job: GhJob): string {
  const yamlStr = fs.readFileSync(job.workflowFile).toString();
  const yamlLines = yamlStr.split('\n');
  const parsed = parseWithPointers(yamlStr);
  const location = getLocationForJsonPath(parsed, ['jobs', job.name, 'steps']);

  let prefix = undefined;

  // the range includes the "steps:" line
  let firstPossibleListItemRowNumber = location!.range.start.line + 1;

  while (prefix === undefined) {
    if (yamlLines[firstPossibleListItemRowNumber].trim().startsWith('-')) {
      prefix = yamlLines[firstPossibleListItemRowNumber].split('-')[0];
    } else {
      firstPossibleListItemRowNumber++;
    }
  }

  yamlLines.splice(
    location!.range.end.line + 1,
    0,
    '',
    `${prefix}- name: Run Stoat Action`,
    `${prefix}  uses: stoat-dev/stoat-action@v0`,
    `${prefix}  if: always()`,
    ''
  );

  return yamlLines.join('\n');
}

export function isOnPushOrPull(on: any) {
  if (String(on) === on) {
    return on === 'pull_request' || on === 'push';
  } else if (Array.isArray(on)) {
    return on.includes('pull_request') || on.includes('push');
  } else if (Object(on) === on) {
    return 'pull_request' in on || 'push' in on;
  } else {
    return false;
  }
}
