import { describe, expect, it } from '@jest/globals';

import { getRootDirectories } from '../../../src/plugins/autoHosting/helpers';

describe('getRootDirectories', () => {
  it('returns nothing when input is empty', () => {
    expect(getRootDirectories([])).toEqual([]);
  });

  it('returns single directory when input has only one directory', () => {
    expect(getRootDirectories(['./docs'])).toEqual(['./docs']);
    expect(getRootDirectories(['./docs/'])).toEqual(['./docs/']);
    expect(getRootDirectories(['./docs/build'])).toEqual(['./docs/build']);
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
