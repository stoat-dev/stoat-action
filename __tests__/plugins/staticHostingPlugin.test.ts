import { expect, test } from '@jest/globals';

import { getUploadSubdomain } from '../../src/plugins/staticHostingPlugin';

test('get upload subdomain', () => {
  expect(getUploadSubdomain('repo.owner', 'test_a', 'sha123456789', 'plugin123456789', 12345)).toBe(
    `repo-owner-test-a-2f006-12345-sha1234-plugin1234`
  );
  expect(getUploadSubdomain('repo.owner', 'test_b', 'sha123456789', 'plugin123456789', null)).toBe(
    `repo-owner-test-b-8d98a-sha1234-plugin1234`
  );
});
