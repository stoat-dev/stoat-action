import chalk from 'chalk';
import { compareVersions } from 'compare-versions';
import latestVersion from 'latest-version';

import { version } from '../../package.json';

export default async function main() {
  try {
    const latest = await latestVersion('stoat');

    const versionWarning = [
      'Your version of the Stoat CLI is out of date!',
      '',
      `Current Version: ${version}`,
      `Available Version: ${latest}`,
      '',
      'Please upgrade by running: npm update -g stoat'
    ];

    if (compareVersions(version, latest) < 0) {
      const longest = Math.max(...versionWarning.map((line) => line.length));
      console.warn(chalk.yellow('-'.repeat(longest)));
      for (const line of versionWarning) {
        console.warn(chalk.yellow(`${line}`));
      }
      console.warn(chalk.yellow('-'.repeat(longest)));
      console.warn();
    }
  } catch (e) {
    // do nothing, internet might not be connected
  }
}
