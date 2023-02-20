import * as core from '@actions/core';
import Ajv from 'ajv';
import fs from 'fs';

import { MetricEntry } from '../../../../types/src';
import stoatSchema from '../../../../types/src/schemas/stoatConfigSchema.json';

const ajv = new Ajv();
const validate = ajv.compile(stoatSchema.definitions.metric_entry);

export const isMetricEntry = (object: any): object is MetricEntry => {
  return validate(object);
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

  if (filename.toLowerCase().endsWith('.csv')) {
    const csvLines = metricJsonString.split('\n').filter((line) => line.trim().length > 0);
    const entries: MetricEntry[] = [];
    for (const csvLine of csvLines) {
      const [value, ...tags] = csvLine.split(',').map((s) => s.trim());
      const parsedValue: number = parseFloat(value);
      if (isNaN(parsedValue)) {
        core.error(`[${taskId}] Metric file ${filename} does not have valid CSV contents. Skip.\n${metricJsonString}`);
        continue;
      }
      const entry: MetricEntry = { value: parsedValue };
      if (tags.length > 0) {
        entry.tags = tags;
      }
      entries.push(entry);
    }
    return entries;
  }

  core.warning(`[${taskId}] Unexpected metric file extension: ${filename}. Expect '.json' or '.jsonl'. Skip.`);
  return [];
};
