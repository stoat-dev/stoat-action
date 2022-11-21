import { expect, test } from '@jest/globals';

import { getUploadSubdomain } from '../../src/plugins/staticHostingPlugin';

test('get upload subdomain', () => {
  expect(getUploadSubdomain('repo.owner', 'test_1', 'sha123456789', 'plugin123456789', 12345)).toBe(
    `owner-repo-1-sha-plugin`
  );
  expect(getUploadSubdomain('repo.owner', 'test_2', 'sha123456789', 'plugin123456789', null)).toBe(
    `owner-repo-sha-plugin`
  );
});
