import _ from 'lodash';

import { GithubRunMatrix } from './types';

/**
 * Check whether a job id or name contains all the matrix variants.
 */
export const isJobMatchMatrixVariant = (jobName: string, matrix: Record<string, string | number> | null): boolean => {
  if (matrix === null) {
    return true;
  }
  const variants = jobName
    .substring(jobName.lastIndexOf('(') + 1, jobName.lastIndexOf(')'))
    .split(',')
    .map((v) => v.trim());
  return _.isEqual(_.sortBy(variants), _.sortBy(Object.values(matrix).map((v) => String(v))));
};

/**
 * Generate a unique id from matrix variants.
 * Variants are sorted by variant key names, and concatenated with hyphens.
 * E.g. { os: 'ubuntu-latest', nodeVersion: 13 } => '13-ubuntu-latest'
 */
export const getMatrixId = (runMatrix: GithubRunMatrix): string => {
  if (runMatrix === null) {
    return '';
  }
  return _.sortBy(Object.entries(runMatrix), ([key]) => key)
    .map(([, value]) => String(value))
    .join('-');
};

/**
 * Generate a string from matrix key and variants.
 * Key variant pairs are sorted by variant key names, and concatenated with commas.
 * E.g. { os: 'ubuntu-latest', nodeVersion: 13 } => 'os: 13, nodeVersion: ubuntu-latest'
 */
export const getMatrixVariantString = (runMatrix: GithubRunMatrix): string => {
  if (runMatrix === null) {
    return '';
  }
  return _.sortBy(Object.entries(runMatrix), ([key]) => key)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};
