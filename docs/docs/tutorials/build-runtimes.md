---
sidebar_position: 104
title: Track Build Times
---

# View build time graph in every PR

The job runtime plugin automatically collects runtime for every GitHub action and presents them in the static comment on pull requests.

To enable this plugin, add a new task with the `job_runtime` plugin in your `.stoat/config.yaml` file:

```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
tasks:
  # Add a task with any arbitrary name.
  build-time-history:
    # The task should have the job runtime plugin.
    job_runtime:
```

Then append the `stoat-dev/stoat-action` to any GitHub action that you want to collect runtime for:

```yaml title=".github/workflows/hello-world.yaml"
name: Hello World

on:
  push:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      # Append the stoat action at the end of each job you want to collect runtime for.
      - name: Run Stoat Action
        uses: stoat-dev/stoat-action@v0
        if: always()
```

That's it. Next time you create a pull request, you should see a line plot of action runtimes in the pinned comment. For example:

<img width="523" alt="job runtime chart" src="https://user-images.githubusercontent.com/1933157/206887357-257a39a5-27b5-4542-bf69-26c71f06522d.png" />

Each line in the plot represents the runtime of a different workflow job across all the commits in the pull request. The x-axis is the short commit SHA, and the y-axis is the runtime in seconds.
