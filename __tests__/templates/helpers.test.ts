import { expect, test } from '@jest/globals';

import { getTemplate } from '../../src/templates';

test('getTemplate read version 1', () => {
  expect(
    getTemplate({
      version: 1,
      comment_template: '__tests__/templates/template1.txt'
    })
  ).toBe('template1');

  expect(
    getTemplate({
      version: 1,
      comment_template: '__tests__/templates/template2.txt'
    })
  ).toBe('template2');
});
