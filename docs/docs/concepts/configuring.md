---
sidebar_position: 1
---

# Configuring Stoat

:::tip

We publish [the full JSON schema for this config file](https://github.com/stoat-dev/stoat-action/blob/main/src/schemas/stoatConfigSchema.json) on our GitHub repo.

:::

There are a few sections of this config:

1. `version` (required) - The version is used to show the compatibility of the config file with the Stoat server version.
   While most changes will be backwards-compatible, you may need to upgrade the version in the future to support some new features.
2. `enabled` (optional) - The enabled flag defaults to `true`. The purpose of this flag is to allow you to easily disable Stoat repo-wide.
3. `comment_template_file` (optional) - When not specified, this uses a remote version of a standard template. We will regularly update the contents of this remote version to include
   improvements for our core set of plugins. You can view a description of the [current default remote v1 template](https://www.stoat.dev/api/templates?stoatConfigVersion=1) via our API.
4. `tasks` (optional) - This is a mapping of a unique task identifier to a task (the configuration for a plugin). More information about how to configure tasks is available in our tutorials.

For now, create a config file at `.stoat/config.yaml` with the following contents:

```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
```
