import chalk from 'chalk';
import { compareVersions } from 'compare-versions';
import latestVersion from 'latest-version';

import { version } from '../../package.json';

const versionWarning = 'Your version of the Stoat CLI is out of date! Please upgrade by running: npm update -g stoat';

export default async function () {
  try {
    const latest = await latestVersion('stoat');

    if (compareVersions(version, latest!)) {
      console.warn(chalk.yellow('-'.repeat(versionWarning.length)));
      console.warn(chalk.yellow(`${versionWarning}`));
      console.warn(chalk.yellow('-'.repeat(versionWarning.length)));
      console.warn();
    }
  } catch (e) {
    // do nothing, internet might not be connected
  }
}
