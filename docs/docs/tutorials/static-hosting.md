# Static Hosting

Builds often produce certain static assets such as:
1. Test coverage reports (from [Jest](https://www.npmjs.com/package/jest-html-reporter), [Jacoco](https://docs.gradle.org/current/userguide/jacoco_plugin.html), etc)
2. [Storybook.js component previews](https://storybook.js.org/docs/react/sharing/publish-storybook)
3. [Docusaurus](https://docusaurus.io/docs/next/installation#build) or other static page outputs.
4. Custom HTML that you generate as part of your build.

## Set Up Stoat

First of all, make sure you've [set up Stoat](../installation) for your repo.

## Configure uploading static assets

### 1. Find the path to static assets

The location of your static assets depends on your repository structure and build configuration. Most build plugins that
produce static outputs have configurable destinations and default destinations.
In our [examples repo](https://github.com/stoat-dev/examples/) the [Stoat config file](https://github.com/stoat-dev/examples/blob/main/.stoat/config.yaml) 
contains example output locations for Gradle JaCoCo html reports (`<gradle-folder>/list/build/reports/html/jacoco`) and Storybook.js output (`<storybook-folder>/storybook-static`).

For the purpose of this tutorial, let's host a file checked into the repo instead of something produced by the build itself. 
Create a file in your repo at the path `hello_world/index.html`:
```html title="hello_world/index.html"
<!DOCTYPE html>
<html>
<head>
  <title>Output</title>
</head>
<body>

<h1>Hello World</h1>

</body>
</html>
```

### 2. Add the Stoat action to your CI workflow after the step that generates your static assets

To allow uploading files to Stoat, you'll need to add the Stoat action after any step in your GitHub workflows that contains files you want to upload.

The Stoat action step looks like:
```yaml
- name: Run Stoat Action
  uses: stoat-dev/stoat-action@v0.0.2
  if: always()
```

Note that you usually want to run the Stoat actin even if prior build steps fail. Let's say you want to upload test reports, those build outputs would be most useful when the GitHub step for testing fails.

To view an example for actual build output, check out our [examples repo](https://github.com/stoat-dev/examples/blob/a0fcc04/.github/workflows/backend.yaml#L33-L35).

For this tutorial we're using a file that we'll check directly into our repo, not a build output, so we can configure a new GitHub workflow with a Stoat action by 
creating a file at `.github/worklows/hello-world.yaml`:
```yaml title=".github/worklows/hello-world.yaml"
name: Hello World

on:
  push:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Run Stoat Action
        uses: ./
        if: always()
```

### 3. Add the path to the Stoat config file

From the [installation guide](../installation), you should have a file with the following contents at `.stoat/config.yaml`:
```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
```

Let's configure Stoat to upload the `hello_world` directory we created in `.stoat/config.yaml`:
```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
tasks:
  hello-world:
    static_hosting:
      path: hello_world
```

This tells Stoat that when the Stoat action runs, if the path `hello_world` has contents, those contents should be uploaded to the
Stoat servers. Here, the key `hello-world` is the id of the task, and the value is the configuration for the `static_hosting` plugin for that task.

### 4. Create a PR and access the file from the Stoat comment!

If you create a branch, commit the files we've created, push the branch, and create a PR, you'll soon see a link in a PR comment to your "Hello World" directory!

You can repeat this with multiple directories. You can also customize how the name of the directory is shown in the PR in `.stoat/config.yaml`:
```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
tasks:
  hello-world:
    metadata:
      name: Hello World
    static_hosting:
      path: hello_world
```

After committing, pushing, and waiting for the build, the name will now show up as `Hello World` instead of the task id `hello-world`.

### That's it!

Using the above steps, you can easily upload any build artifacts for your PRs!

## Customize templating

If you'd like to customize what the Stoat PR comment looks like, check out our [templating tutorial](templating.md).
