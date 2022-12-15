# How to create previews for typical JavaScript build outputs

A typical build for a JavaScript / TypeScript project is composed of many process and various outputs:
- Unit test and test coverage reports
- Integration test artifacts like Cypress screenshots and videos
- Visual preview like Storybook
- Documentation
- The packaged code in the `dist` directory

Though useful for debugging and development, these outputs are usually discarded immediately, especially in continuous integration (CI) pipelines. The problem is that they are not easily accessible. It's already hard for developers to memorize where they are when build is run locally. (Who could tell right away that the human-readable version of the Jest coverage report is under `coverage/lcov-report` by default?) It is almost impossible to take a look at those outputs from a CI pipeline running remotely

This is where Stoat comes to help. With Stoat integration, all kinds of build outputs can be hosted for easy access with every CI run. In this doc, we are going to show you how to create previews for typical JavaScript build outputs. We are going to use this repo as an example: [penx/storybook-code-coverage](https://github.com/penx/storybook-code-coverage), authored by [Alasdair McLeay](https://github.com/penx). The author wrote a detailed article about the set-up of this repo: [Combining Storybook, Cypress and Jest Code Coverage](https://dev.to/penx/combining-storybook-cypress-and-jest-code-coverage-4pa5). Briefly, this repo uses Jest for unit test, Cypress for integration test, and Storybook for visual preview. They each generate their own test coverage reports, which can be merged together into one report. There is no GitHub workflow to chain them together, but that can be done easily with all the `npm` scripts.

Our goal here is to 1) write a GitHub workflow to run the CI pipeline, and 2) integrate Stoat into the workflow to provide previews for the build outputs for every pull request in the future. To fully leverage the build, the preview will include not only the test coverage reports, but also the latest static Storybook pages and Cypress video.

Step 1. Add a GitHub workflow

Create a YAML file at `.github/workflows/ci.yaml` with the following content:

```yaml title=".github/workflows/ci.yaml"
name: Continuous Integration

on:
  # Trigger the ci pipeline for every comment on the default branch or a pull request.
  # The default branch for the sample repo is `master`.
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Set up node and cache
        uses: actions/setup-node@v3
        with:
          node-version: '16.8.0'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile --prefer-offline

      # This project has a `coverage` script that runs all the
      #  tests and merge all their coverage reports.
      - name: Run tests and generate report
        run: yarn coverage

      - name: Generate storybook
        run: yarn build-storybook

      # Run the Stoat action to upload and host all the build outputs.
      - name: Run stoat action
        uses: stoat-dev/stoat-action@v0
        if: always()
```

When you set it up for your own projects, most of the YAML file can be exactly the same. The only differences are:
- Replace `master` with the name of your default branch.
- Replace `16.8.0` with the version of Node.js you are using.
- Run the test script that is set in `package.json`. Typically, it is `jest --coverage` for unit test.

Note that the Stoat action is appended at the end of the `ci` job. This one step can carry out various tasks according to the Stoat config.

Step 2. Add the Stoat config.

Create `.stoat/config.yaml` at the root of the project and paste in the following content:

```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
tasks:
  merged-test-coverage:
    static_hosting:
      path: coverage/merged/lcov-report
  storybook:
    static_hosting:
      path: storybook-static
  cypress-video:
    static_hosting:
      path: cypress/videos/spec.js.mp4
```

The Stoat config is a YAML file that contains a list of tasks. Each task contains one Stoat plugin. In the example above, we have four tasks:

- Task `merged-test-coverage` looks for the test coverage report under `coverage/merged/lcov-report`, and uses the Stoat `static_hosting` plugin to upload it to the Stoat server. The entire directory will be uploaded, so the preview will include all the HTML, JavaScript, and CSS files.
- Task `storybook` is very similar. It looks for the static Storybook build under `storybook-static`, and uploads them to the Stoat server.
- Same for the `cypress-video` task. The only difference is that this task uploads a single file instead of a directory.
