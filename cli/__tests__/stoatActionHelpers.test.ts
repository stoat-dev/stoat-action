import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import { addStoatActionToYaml } from '../src/helpers/init/configFileHelpers';

describe('Add Stoat Action to YAML', () => {
  test('add action to build job', async () => {
    expect(addStoatActionToYaml({ name: 'build', workflowFile: path.join(__dirname, 'example.yaml') })).toEqual(
      fs.readFileSync(path.join(__dirname, 'expected-add-build.yaml')).toString()
    );
  });

  test('add action to build2 job', async () => {
    expect(addStoatActionToYaml({ name: 'build2', workflowFile: path.join(__dirname, 'example.yaml') })).toEqual(
      fs.readFileSync(path.join(__dirname, 'expected-add-build2.yaml')).toString()
    );
  });

  test('add action to both build and build2 jobs', async () => {
    expect(
      addStoatActionToYaml({ name: 'build2', workflowFile: path.join(__dirname, 'expected-add-build.yaml') })
    ).toEqual(fs.readFileSync(path.join(__dirname, 'expected-add-build-and-build2.yaml')).toString());
  });
});
