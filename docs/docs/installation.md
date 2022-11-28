---
sidebar_position: 3
---

# Setting Up Stoat

## 1. Choose a GitHub Repo

Start out by either choosing an existing repo that you want to use or create a repo specifically for trying out Stoat.
For Stoat to be useful, the repo used should have at least one GitHub workflow used as part of a CI build.

:::caution

We currently only recommend using Stoat for **public repos**. Authentication is [on our roadmap](roadmap), but until it's released,
know that any files or any other pieces of data you send to Stoat for templating are publicly accessible! 

:::

## 2. Add Stoat Configuration to Repo

Stoat uses file-based configuration that you check into your repo. This config file is located from the root of the repository at `.stoat/config.yaml`.

:::tip

We publish [the full JSON schema for this config file](https://github.com/stoat-dev/stoat-action/blob/main/src/schemas/stoatConfigSchema.json) on our GitHub repo. 

:::

There are a few sections of this config:

1. `version` (required) - The version is used to show the compatibility of the config file with the Stoat server version. 
While most changes will be backwards-compatible, you may need to upgrade the version in the future to support some new features.
2. `enabled` (optional) - The enabled flag defaults to `true`. The purpose of this flag is to allow you to easily disable Stoat repo-wide.
3. `comment_template_file` (optional) - When not specified, this uses a remote version of a standard template. We will regularly update the contents of this remote version to include
improvements for our core set of plugins. You can view a description of the [current default remote v1 template](https://www.stoat.dev/api/templates?stoatConfigVersion=1) via our API.
4. `plugins` (optional) - This is a mapping of a unique identifier for a plugin to the configuration for that plugin. More information about how to configure these plugins is available in our tutorials.

For now, create a config file at `.stoat/config.yaml` with the following contents:
```yaml
---
version: 1
enabled: true
```

## 3. Install Stoat Application

Go to [the Stoat GitHub app page](https://github.com/apps/stoat-app/) and install the application for your repository. If you have any question about the permissions
or run into any problems with installing, please [let us know](mailto:contact@stoat.dev).

## Start using Stoat!

To get value out of Stoat, you'll need to start pushing data to Stoat. Check out our [static hosting](tutorials/static-hosting) and [templating](tutorials/templating) tutorials to see examples.
