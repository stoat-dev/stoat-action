import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';

import { addStoatActionToYaml, isOnPushOrPull } from '../src/helpers/init/configFileHelpers';

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

describe('Check if we should add Stoat Action', () => {
  test('on: push', async () => {
    const workflowYaml = `on: push`;
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(true);
  });

  test('on: [push]', async () => {
    const workflowYaml = `on: [push]`;
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(true);
  });

  test('on: 44', async () => {
    const workflowYaml = `on: 44`;
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(false);
  });

  test('on: 44', async () => {
    const workflowYaml = `
on:
  issues:
    types:
      - opened
      - labeled`.trim();
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(false);
  });

  test('on: [fork, pull_request]', async () => {
    const workflowYaml = `on: [fork, pull_request]`;
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(true);
  });

  test('on: push:', async () => {
    const workflowYaml = `
on:
  push:`.trim();
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(true);
  });

  test('on issues and pull request:', async () => {
    const workflowYaml = `
on:
  issues:
    types:
      - opened
      - labeled
  pull_request:`.trim();
    const workflow: any = yaml.load(workflowYaml);

    expect(isOnPushOrPull(workflow.on)).toEqual(true);
  });
});
