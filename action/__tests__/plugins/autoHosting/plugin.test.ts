import { describe, expect, it } from '@jest/globals';

import { getRootDirectories, getSubtaskId } from '../../../src/plugins/autoHosting/plugin';

describe('getRootDirectories', () => {
  it('returns nothing when input is empty', () => {
    expect(getRootDirectories([])).toEqual([]);
  });

  it('returns single directory when input has only one directory', () => {
    expect(getRootDirectories(['./docs'])).toEqual(['./docs']);
    expect(getRootDirectories(['./docs/'])).toEqual(['./docs/']);
    expect(getRootDirectories(['./docs/build'])).toEqual(['./docs/build']);
  });

  it('removes empty inputs', () => {
    expect(getRootDirectories(['  ', './docs', ''])).toEqual(['./docs']);
  });

  it('prunes subdirectories for a single root directory', () => {
    expect(
      getRootDirectories([
        './docs/build/blog',
        './docs/build',
        './docs/build/blog/archive',
        './docs/build/doc',
        './docs/build/markdown-page'
      ])
    ).toEqual(['./docs/build']);
  });

  it('prunes subdirectories for multiple root directories', () => {
    expect(
      getRootDirectories([
        './docs/build/blog',
        './docs/build',
        './coverage/lcov-report/helpers',
        './docs/build/blog/archive',
        './coverage/lcov-report',
        './docs/build/doc',
        './docs/build/markdown-page'
      ])
    ).toEqual(['./coverage/lcov-report', './docs/build']);
  });
});

describe('getSubtaskId', () => {
  it('generates the correct subtask id', () => {
    expect(getSubtaskId('./')).toEqual('-');
    expect(getSubtaskId('./a')).toEqual('a');
    expect(getSubtaskId('./a/b/c')).toEqual('a-b-c');
  });
});
