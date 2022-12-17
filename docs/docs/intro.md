---
sidebar_position: 1
---

# What is Stoat?

Stoat is a SaaS platform for developer tooling focused on aggregating data across GitHub builds into a single pull request comment
that is updated as new data becomes available. This comment as a customizable build dashboard embedded in your pull requests.

In only a few minutes, you can access test coverage reports, Storybook.js component summaries, build time summaries, and more from a GitHub comment:

![Stoat Screenshot](../static/img/example-screenshot.png)

## Technical Details

* [Stoat GitHub Action](https://github.com/stoat-dev/stoat-action)
  * Pushes data (build reports, static sites, metrics, JSON) for builds to the Stoat server.
* [Stoat GitHub Application](https://github.com/apps/stoat-app)
  * Calls the Stoat server to render comments.
* Stoat Server
  * Listens for webhooks from the GitHub application.
  * Stores and aggregates build data pushed by the GitHub action.
  * Serves static files.
  * Creates and updates pull request comments.

## Get Started

It only takes a couple of minutes to add Stoat to your repo.

[Try our getting started guide to set up Stoat today!](./installation)
