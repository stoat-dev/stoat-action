# CLI

Stoat provides a CLI to help configure Stoat and interact with the GitHub comment locally.
This is useful for previewing what the comment will look like on a pull request or running Stoat on a private GitHub repo.

## Installation

Requirements:
- Node/NPM
- Mac/Linux

To install, run:
```
npm i -g stoat
```

## Initialize project

To initialize a Stoat project within a Git repo:
```
stoat init
```

This will create the Stoat config file and prompt you about adding actions to your Github workflow files.
We recommend following the prompts and adding the action to any workflow that will push data you want to collect in your comment.

## Local mode

:::tip

Local mode doesn't send any of your code or build artifacts off of your computer! 
This is safe to run for private repos before we add support for authenticating our static hosting endpoints.

:::

To preview your comment locally:
```
stoat local
```

This requires that Stoat is already configured for the Git repo. Keep in mind that Stoat does not send any build data to the Stoat server and doesn't pull in any metric/build data from the server in local mode.
This comment preview is purely based on the current contents of the local files in your Git repo. You will need to run your build to generate any
artifacts you hope to display.
