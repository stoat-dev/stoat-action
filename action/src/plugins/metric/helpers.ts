import * as core from '@actions/core';
import fs from 'fs';

import { MetricEntry } from '../../../../types/src';

export const isMetricEntry = (object: any): object is MetricEntry => {
  if (typeof object !== 'object') {
    return false;
  }
  if (!('value' in object) || typeof object.value !== 'number') {
    return false;
  }
  if ('tag' in object && typeof object.tag !== 'string') {
    return false;
  }
  if ('tags' in object && !Array.isArray(object.tags)) {
    if (!Array.isArray(object.tags)) {
      return false;
    }
    if (object.tags.some((tag: any) => typeof tag !== 'string')) {
      return false;
    }
  }
  return true;
};

export const parseMetricFile = async (taskId: string, filename: string, maxChar: number): Promise<MetricEntry[]> => {
  const metricJsonString = fs.readFileSync(filename).toString();

  if (metricJsonString.length > maxChar) {
    core.error(
      `[${taskId}] Metric file ${filename} exceeds character limit. Limit: ${maxChar}. Actual: ${metricJsonString.length}. Skip.`
    );
    return [];
  }

  if (filename.toLowerCase().endsWith('.json')) {
    try {
      const entry = JSON.parse(metricJsonString);
      if (isMetricEntry(entry)) {
        return [entry];
      } else {
        core.warning(`[${taskId}] Metric file ${filename} contains invalid JSON entry: ${metricJsonString}. Skip.`);
        return [];
      }
    } catch (e) {
      core.error(`[${taskId}] Metric file ${filename} does not have valid JSON contents: ${metricJsonString}. Skip.`);
      return [];
    }
  }

  if (filename.toLowerCase().endsWith('.jsonl')) {
    try {
      const jsonLines = metricJsonString.split('\n').filter((line) => line.trim().length > 0);
      const entries: MetricEntry[] = [];
      for (const jsonLine of jsonLines) {
        const entry = JSON.parse(jsonLine);
        if (isMetricEntry(entry)) {
          entries.push(entry);
        } else {
          core.warning(`[${taskId}] Metric file ${filename} contains invalid JSON entry: ${jsonLine}. Skip.`);
        }
      }
      return entries;
    } catch (e) {
      core.error(`[${taskId}] Metric file ${filename} does not have valid JSONL contents. Skip.\n${metricJsonString}`);
      return [];
    }
  }

  core.warning(`[${taskId}] Unexpected metric file extension: ${filename}. Expect '.json' or '.jsonl'. Skip.`);
  return [];
};