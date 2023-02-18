import * as core from '@actions/core';
import fs from 'fs';

import { MetricEntry } from '../../../../types/src';

export const parseMetricFile = async (taskId: string, filename: string, maxChar: number): Promise<MetricEntry[]> => {
  const metricJsonString = fs.readFileSync(filename).toString();
  if (metricJsonString.length > maxChar) {
    core.error(
      `[${taskId}] Metric file exceeds character limit. Limit: ${maxChar}. Actual: ${metricJsonString.length}. Skip.`
    );
    return [];
  }

  if (filename.toLowerCase().endsWith('.json')) {
    let metricJson: MetricEntry;
    try {
      metricJson = JSON.parse(metricJsonString) as MetricEntry;
    } catch (e) {
      core.error(`[${taskId}] Metric file does not have valid JSON contents: ${metricJsonString}. Skip.`);
      return [];
    }
    return [metricJson];
  }

  if (filename.toLowerCase().endsWith('.jsonl')) {
    const jsonLines = metricJsonString.split('\n');
    try {
      return jsonLines.map((json) => JSON.parse(json) as MetricEntry);
    } catch (e) {
      core.error(`[${taskId}] Metric file does not have valid JSONL contents: ${jsonLines}. Skip.`);
      return [];
    }
  }

  core.warning(`[${taskId}] Unexpected metric file extension: ${filename}. Expect '.json' or '.jsonl'. Skip.`);
  return [];
};
