import { faker } from '@faker-js/faker';
import { expect, test } from '@jest/globals';

import { getHash, getUniqueToken, getUploadSubdomain } from '../../../src/plugins/staticHosting/helpers';

test('getHash', () => {
  expect(getHash('')).toBe('-');
  expect(getHash('stoat-action')).toBe('6c25743a355434d2129c338fc9a618ea');
});

test('getUniqueToken', () => {
  // when there is no truncation
  expect(getUniqueToken('1234567890', 15, 5)).toBe('1234567890');
  expect(getUniqueToken('1234567890', 10, 5)).toBe('1234567890');

  // when there is truncation
  expect(getUniqueToken('1234567890', 7, 1)).toBe('12345-e');
  expect(getUniqueToken('1234567890', 7, 3)).toBe('123-e80');
  expect(getUniqueToken('1234567890', 7, 5)).toBe('1-e807f');
  expect(() => getUniqueToken('1234567890', 7, 6)).toThrowError();

  // lowercase
  expect(getUniqueToken('UPPERCASE', 100, 3)).toBe('uppercase');
  expect(getUniqueToken('UpperCase', 100, 3)).toBe('uppercase');

  // when there are special characters
  expect(getUniqueToken('.12!34@56#78$90.', 100, 10)).toBe('12-34-56-78-90');
  expect(getUniqueToken('.12!34@56#78$90.', 10, 3)).toBe('12-34-004');
  expect(getUniqueToken('12!@#$345678!@#$90', 100, 10)).toBe('12-345678-90');
  expect(getUniqueToken('12!@#$345678!@#$90', 10, 3)).toBe('12-345-a6a');

  // random tests
  const totalLength = 30;
  for (let i = 0; i < 100; i++) {
    const input = faker.company.name();
    const uniqueToken = getUniqueToken(input, totalLength, 5);
    expect(uniqueToken.length).toBeLessThanOrEqual(totalLength);
    expect(uniqueToken.includes('--')).toBeFalsy();
    expect(uniqueToken.startsWith('-')).toBeFalsy();
    expect(uniqueToken.match(/^[^0-9A-Za-z]/)).toBeFalsy();
    expect(uniqueToken.match(/[^0-9A-Za-z]$/)).toBeFalsy();
  }
});

test('getUploadSubdomain', () => {
  expect(getUploadSubdomain('repo.owner.abcdefg', 'test_abcdefgh', 'sha123456789', 'static-hosting')).toBe(
    `repo-owne-d756a--test-abcdefgh--sha1234--stati-3ee3`
  );
});
