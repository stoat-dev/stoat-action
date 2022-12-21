---
sidebar_position: 1
---

# Configuring Stoat

The Stoat config file is located at `.stoat/config.yaml` file in a Git repository. 
We recommend following our [getting started guide](../installation) to use the CLI to create this file.

:::tip

We publish [the full JSON schema for this config file](https://github.com/stoat-dev/stoat-action/blob/main/src/schemas/stoatConfigSchema.json) on our GitHub repo.

:::

This YAML file has a few sections:

1. `version` (required) - The version is used to show the compatibility of the config file with the Stoat server version.
   While most changes will be backwards-compatible, you may need to upgrade the version in the future to support some new features.
2. `enabled` (optional) - The enabled flag defaults to `true`. The purpose of this flag is to allow you to easily disable Stoat repo-wide.
3. `comment_template_file` (optional) - When not specified, this uses a remote version of a standard template. We will regularly update the contents of this remote version to include
   improvements for our core set of plugins. You can view a description of the [current default remote v1 template](https://www.stoat.dev/api/templates?stoatConfigVersion=1) via our API.
4. `plugins` (optional) - This is a mapping of a plugin to the configuration for a plugin. 
   Stoat has [static hosting](./static-hosting), [job runtime](../tutorials/build-runtimes), and [raw json](./aggregation) plugins.
   Some plugins like job runtime are configured for the entire repo, while other plugins like [static hosting](./static-hosting) and [raw json](./aggregation) are configured for specific tasks, or plugin instances.
   Each task has a user-defined task id, which is used to reference the outputs in the [comment template](./templating).
   Each task can also specify a `metadata` key.
   Our default templates for `static_hosting` use the value for a `name` within `metadata` to label links.
   However, for your own templating convenience, you can store any data with any structure within `metadata`.

   Here are examples of tasks for each of the plugin types:

   ```yaml title="static_hosting"
   plugins:
     static_hosting:
       docs:
         metadata:
           name: Documentation
         path: build/static-docs
   ```

   ```yaml title="json"
   plugins:
     json:
       docs:
         path: build/build_metadata.json
   ```
   
   ```yaml title="job_runtime"
   plugins:
     job_runtime:
       enabled: true
   ```

##  Debugging

If you're wondering what config file was used to generate a specific comment, click the "debug" button at the bottom of the Stoat comment.
The contents of the Stoat config file will be available, rendered in JSON.
