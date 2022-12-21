
<h1 align="center">
  <br>
  <a href="https://docs.stoat.dev/"><img src="https://stoat-dev--static.stoat.page/branding/android-chrome-192x192.png" alt="Stoat" width="192"></a>
  <br>
  Stoat
  <br>
</h1>

<h4 align="center">Turn pull request comments into developer dashboards.</h4>

<p align="center">
  <a href="https://github.com/stoat-dev/stoat-action/actions/workflows/test-action.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/stoat-dev/stoat-action/test-action.yaml?branch=main&label=action"
         alt="action build status">
  </a>
  <a href="https://github.com/stoat-dev/stoat-action/actions/workflows/test-cli.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/stoat-dev/stoat-action/test-cli.yaml?branch=main&label=cli"
         alt="cli build status">
  </a>
  <a href="https://github.com/stoat-dev/stoat-action/actions/workflows/docs.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/stoat-dev/stoat-action/docs.yaml?branch=main&label=docs"
         alt="docs build status">
  </a>
</p>

<p align="center">
  <a href="https://twitter.com/stoat_dev">
    <img src="https://img.shields.io/twitter/follow/stoat_dev?style=social"
         alt="twitter">
  </a>
  <a href="https://github.com/stoat-dev/stoat-action">
    <img src="https://img.shields.io/github/stars/stoat-dev/stoat-action?style=social"
         alt="github stars">
  </a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#how-to-use-stoat">How to Use Stoat</a> •
  <a href="#license">License</a>
</p>

<p align="center">
<img src="https://stoat-dev--static.stoat.page/screenshot-python.png" alt="screenshot" width="600">
</p>

## Quick Start

You can view a chart of GitHub job runtimes in a PR comments in just two minutes!

### 1. Install GitHub Application

Go to the [Stoat GitHub application page](https://github.com/apps/stoat-app/) and install the application for your repository.

### 2. Install CLI

Requirements:
- Node/NPM
- Mac/Linux

To install the CLI, run:
```
npm i -g stoat
```

### 3. Initialize Stoat

To initialize a Stoat project within a Git repository, run:
```
stoat init
```

The initialization command will create a configuration file for Stoat at `.stoat/config.yaml`
and will give you the option to add the Stoat GitHub action as the final step in all GitHub jobs. 
Say yes for every job you want to track job runtimes for. Merge these changes into your repo. 

### That's it!

You will now see build runtimes tracked in your PRs! 

Stoat is capable of quite a bit more. [Check out our docs for more information »](https://docs.stoat.dev/)

## How to Use Stoat

* [For Java Engineers](https://docs.stoat.dev/docs/why-stoat/java)
* [For JavaScript Engineers](https://docs.stoat.dev/docs/why-stoat/javascript)
* [For Python Engineers](https://docs.stoat.dev/docs/why-stoat/python)
* [For DevOps Engineers](https://docs.stoat.dev/docs/why-stoat/devops)
* [For Engineering Managers](https://docs.stoat.dev/docs/why-stoat/managers)

## License

MIT
