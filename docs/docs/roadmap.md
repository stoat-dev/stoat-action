---
sidebar_position: 8
---

# Roadmap

This is a directional roadmap that will evolve over time. 
In the future, we will add more guidance on the timeline for these items.
We'd love your input on what we should be working on! If you have a feature request, bugs you've encountered, 
rough edges, or anything that makes Stoat difficult to use, please send us feedback at [contact@stoat.dev](mailto:contact@stoat.dev).

:::tip

Please [sign up for our mailing list](https://forms.gle/5EAfBMP1APQLLe2B7) or [follow our Twitter](https://twitter.com/stoat_dev) if you would like to be notified when we
make progress!

:::

## Private Repo Support

Currently, Stoat is only supported for public repos. 
Any artifacts with status hosting and debugging links for comments are public and unauthenticated. 
We will introduce GitHub-based authentication for private repos, where all users with read access can access hosted artifacts and debug links for the repository.
This will be a paid feature.

## Aggregate events for a branch
In order to display more complex information about a PR, it will be necessary to aggregate a sequence of events for a single branch. 
For example, if you want to maintain a list of integration tests manually launched for an individual PR or branch in the Stoat comment.
While this is technically possible to do today, it isn't ergonomic.

## Consuming events from other branches

When tracking a metric such as test runtime, users often want to compare the value of the current branch/PR's value with the value of the `main` or `master` branch.
We will introduce the ability to read events from specified branches and use those values to render the Stoat static comment.

## Charts

When comparing events between branches (or even within the same branch), users often want to construct charts and render them in the Stoat static comment so 
the data can easily be understood at a glance. While this is possible today by generating a chart in a GitHub action, uploading it, and then linking to it via the 
comment config, we'd prefer to make this functionality native.

## Workflow Dispatch Validation

When launching GitHub workflows at a PR level, many users end up using a "chat-ops" approach using a [slash command dispatch action](https://github.com/peter-evans/slash-command-dispatch) 
to allow users to run certain actions by running `/test env=staging` or similar commands in GitHub comments.
While this works reasonably well in the best case, re-running slash commands while iterating on a PR can quickly become noisy.
Additionally, when there are many parameters for these actions or any parameters that require validation, this approach gets out of control.
We would like to introduce an authenticated UI that allows user to enter and validate any number of input parameters for an action (beyond the 10 inputs limit).
This UI would record its run history in the Stoat static comment and allow re-running actions easily after changes are made on the PR.
This is in the early stages, and we'd appreciate [feedback](mailto:contact@stoat.dev).

## Stoat Dashboard

As Stoat starts to gather events and metrics from across your repo, there are cross-branch or `main`-branch summaries that 
users would like to see on the Stoat website instead of just on Stoat static comments.
If you have any dashboard views that you'd like to generate for your repo, [please let us know](mailto:contact@stoat.dev).

## Programmatic Comment Rendering

Instead of only allowing using templating languages to render Stoat static comments, 
we would like to allow programmatic rendering by allowing users to specify a JavaScript function
that transforms the event input into an output comment. If you encounter any use case that is
hard to express with only a template, please [drop us a line](mailto:contact@stoat.dev). 
We'd love to understand your use case!
