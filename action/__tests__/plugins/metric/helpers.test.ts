import { describe, expect, it } from '@jest/globals';

import { parseMetricFile } from '../../../src/plugins/metric/helpers';

const metric1File = '__tests__/plugins/metric/metric1.json';
const expectedMetric1 = [{ value: 1, tag: 'test' }];
const metric2File = '__tests__/plugins/metric/metric2.jsonl';
const expectedMetric2 = [
  { value: 1, tags: ['test1', 'test2'] },
  { value: 2, tag: 'test1' }
];

const invalid1File = '__tests__/plugins/metric/invalid1.json';
const invalid2File = '__tests__/plugins/metric/invalid2.jsonl';
const expectedInvalid2 = [{ value: 1, tag: 'g1' }];

describe('parseMetricFile', () => {
  it('ignores oversize files', async () => {
    const entries = await parseMetricFile('test', metric1File, 0);
    expect(entries).toEqual([]);
  });

  describe('json', () => {
    it('returns the parsed json', async () => {
      const entries = await parseMetricFile('test', metric1File, 10000);
      expect(entries).toEqual(expectedMetric1);
    });

    it('ignores invalid json', async () => {
      const entries = await parseMetricFile('test', invalid1File, 10000);
      expect(entries).toEqual([]);
    });
  });

  describe('jsonl', () => {
    it('returns the parsed jsonl', async () => {
      const entries = await parseMetricFile('test', metric2File, 10000);
      expect(entries).toEqual(expectedMetric2);
    });

    it('ignores invalid json lines', async () => {
      const entries = await parseMetricFile('test', invalid2File, 10000);
      expect(entries).toEqual(expectedInvalid2);
    });
  });
});
