import chalk from 'chalk';
import { compareVersions } from 'compare-versions';
import latestVersion from 'latest-version';

import { version } from '../../package.json';

export default function () {
  (async () => {
    try {
      const latest = await latestVersion('stoat');
      if (compareVersions(version, latest)) {
        console.warn(
          chalk.yellow(
            'Your version of the stoat CLI is out of date! Please upgrade by running: npm update -g stoat\n\n'
          )
        );
      }
    } catch (e) {
      // do nothing, internet might not be connected
    }
  })();
}
