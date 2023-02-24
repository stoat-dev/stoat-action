---
sidebar_position: 111
title: Track Custom Metrics
---

# Track Custom Metrics

The `metric` and `chart` plugins can be used together to 1) collect custom metrics from your build and 2) visualize them in one or multiple charts in the Stoat comment.

<img width="523" alt="job runtime chart" src="https://stoat-dev--static.stoat.page/screenshot-metric-and-chart.png" />

## Metric plugin

The `metric` plugin can be used to collect custom metrics from your build. Each `metric` task expects an input filename. Any data in this file will be uploaded to Stoat server.

Here is a sample Stoat config with the `metric` plugin enabled:

```yaml title=".stoat/config.yaml"
version: 1
enabled: true
plugins:
  metric:
    metric-task-1:
      filename: metric.json
    metric-task-2:
      filename: metric.jsonl
    metric-task-3:
      filename: metric.csv
```

Currently, three file formats are supported: `JSON`, `JSONL` and `CSV`.

The `JSON` file expects one `JSON` object with the following schema:

| Field | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `value` | Yes | number | The value of the metric. |
| `tag` | No | string | A tag for the metric. |
| `tags` | No | string array | An array of tags for the metric. |

A sample file looks like this:

```json title="metric.json"
{ "value": 1, "tag": "tag1", "tags": ["tag1", "tag2"] }
``` 

The `JSONL` file expects one `JSON` object per line. Each JSON object should follow the schema above. A sample file looks like this:

```jsonl title="metric.jsonl"
{ "value": 1 }
{ "value": 2, "tag": "tag1" }
{ "value": 3, "tags": ["tag1", "tag2"] }
{ "value": 4, "tag": "tag1", "tags": ["tag2", "tag3"] }
```

The `CSV` file expects one metric value per line. No header line is needed. The first column is the numeric value, followed by any number of tag columns. A sample file looks like this:

```csv title="metric.csv"
1
2,tag1
3,tag1,tag2
4,tag1,tag2,tag3
```

Each metric can have multiple tags. The tags are used to filter the metrics in the chart. See the chart plugin for details.

Please note that the metric task id is automatically added as a tag to all metric values in the relevant file. For example, with the following metric task:

```yaml title=".stoat/config.yaml"
version: 1
enabled: true
plugins:
  metric:
    runner_memory:
      filename: metric.csv
```

and the following metric file:

```csv title="metric.csv"
1,free
2,used
3,cached
```

Value `1` will be tagged with `runner_memory` and `free`. Value `2` will be tagged with `runner_memory` and `used`. And so on.

This is useful when you want to filter the metrics by the task id.

To append metric values to the file, you can use the `>>` operator in the GitHub action:

```yaml
- name: Collect metrics
  run: |
    echo "1,free" >> metric.csv
    echo "2,used" >> metric.csv
    echo "3,cached" >> metric.csv
```

## Chart plugin

The `chart` plugin groups metrics by tags and present them in charts. Each `chart` task expects the following parameters and generates one chart.

| Parameter | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `title` | Yes | string | The title of the chart. |
| `y_title` | No | string | The title of the Y axis. |
| `tags` | Yes | string array | Tags of the metric values to include in the chart. |

Each chart can have multiple data lines. Metric values with the same tag will form one data line in the chart.

For example, with the following chart task:

```yaml title=".stoat/config.yaml"
version: 1
enabled: true
plugins:
  chart:
    runner_memory_chart:
      title: Runner Memory
      y_title: Size (bytes)
      tags:
        - free
        - used
    runner_cpu_chart:
      title: Runner CPU
      y_title: Runtime (s)
      tags:
        - user
        - system
        - idle
```

Two charts will be generated. The first chart will have two lines: one for free memory size and one for used memory size. The second chart will have three lines for user, system, and idle CPU time.

## Combination of metric and chart plugins

The `chart` tasks do not have 1 to 1 mapping with the `metric` tasks. It is possible to have only one `metric` task and multiple `chart` tasks, or multiple `metric` tasks and only one `chart` task. The `chart` tasks only care about the tags of the metric values to be included.

The simplest use case is to have one `metric` task, and append all metric values to the same  file. Each value can have different tags. However, it is mentally convenient to create multiple `metric` tasks, each for a different use case.

## TODOs
- Compare metrics from pull requests and the default branch.
- Add interactive chart view.
- Migrate away from QuickChart.
- Add aggregate chart view in Stoat dashboard.
- Ingest metrics through API.

## Changelog

| Date | Description |
| :--- | :--- |
| 2023-02-24 | Add TODOs. |
| 2023-02-23 | Add initial docs for metric and chart plugins. |
