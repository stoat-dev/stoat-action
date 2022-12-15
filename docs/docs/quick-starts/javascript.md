# Add Stoat for JavaScript with Jest, Storybook, and Cypress

```yaml title=".github/workflows/build.yaml"
name: Build

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '16.8.0'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile --prefer-offline
      - name: Run tests and generate report
        run: yarn coverage
      - name: Generate storybook
        run: npm run build-storybook
      - name: Run stoat action
        uses: stoat-dev/stoat-action@v0
        if: always()
```

```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
tasks:
  merged-test-coverage:
    metadata:
      name: Merged Test Coverage
    static_hosting:
      path: coverage/merged/lcov-report
  storybook:
    metadata:
      name: Storybook
    static_hosting:
      path: storybook-static
  cypress-video:
    metadata:
      name: Cypress Video
    static_hosting:
      path: cypress/videos/spec.js.mp4
  build-time:
    job_runtime:
```
