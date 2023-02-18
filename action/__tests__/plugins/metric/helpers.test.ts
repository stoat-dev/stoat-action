import { describe, expect, it } from '@jest/globals';

import { parseMetricFile } from '../../../src/plugins/metric/helpers';

const metric1File = '__tests__/plugins/metric/metric1.json';
const expectedMetric1 = [{ value: 1, tag: 'test' }];
const metric2File = '__tests__/plugins/metric/metric2.jsonl';
const expectedMetric2 = [
  { value: 1, tags: ['test1', 'test2'] },
  { value: 2, tag: 'test1' }
];

describe('parseMetricFile', () => {
  describe('json', () => {
    it('returns the parsed json', async () => {
      const entries = await parseMetricFile('test', metric1File, 10000);
      expect(entries).toEqual(expectedMetric1);
    });
  });

  describe('jsonl', () => {
    it('returns the parsed jsonl', async () => {
      const entries = await parseMetricFile('test', metric2File, 10000);
      expect(entries).toEqual(expectedMetric2);
    });
  });
});
