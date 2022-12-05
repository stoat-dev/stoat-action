import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import { addStoatActionToYaml } from '../src/lib/init/configFileHelpers';

describe('Add Stoat Action to YAML', () => {
  test('addStoatActionToYaml', async () => {
    expect(addStoatActionToYaml({ name: 'build', workflowFile: path.join(__dirname, 'example.yaml') })).toEqual(
      fs.readFileSync(path.join(__dirname, 'expected-added-build.yaml')).toString()
    );
  });
});
