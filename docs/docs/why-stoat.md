---
sidebar_position: 6
---

# Why Stoat?

A common question about Stoat is why using a new action while there are already many other actions that can do similar things. For example, a user can apply the [`create-or-update-comment` action](https://github.com/peter-evans/create-or-update-comment) to maintain a comment on a PR, and post whatever information there. The answer is simplicity. Let's go through a detailed example of the `create-or-update-comment` action. To guarantee that the information in the comment is always up-to-date, there are three requirements:

  - Create a new comment when the PR is opened.
  - Update the comment when the PR is updated.
  - Update or delete the comment when the comment is no longer needed.

Suppose there is a step, `output_information`, that generates the information that we want to post to the PR, the complete steps needed to fulfill the above three requirements are:

```yaml title=".github/workflows/post-comment.yaml"
# This step generates the information that we want to post to the PR.
# It may also generate nothing, which means the comment is not needed.
- name: Output information
  id: output_information

# If the comment already exists, we want to locate it.
- name: Find the existing comment if it exists
  uses: peter-evans/find-comment@v2
  id: find_comment
  with:
    issue-number: ${{ github.event.pull_request.number }}
    comment-author: "github-actions[bot]"
    # This step uses a unique identifier in the comment body to locate the comment.
    # It is necessary for the remove_deprecated_comment step.
    body-includes: "comment-identifier"

- name: Create or update the comment
  if: steps.output_information.outputs.comment == 'true'
  uses: peter-evans/create-or-update-comment@v2
  with:
    issue-number: ${{ github.event.pull_request.number }}
    comment-id: ${{ steps.find_comment.outputs.comment-id }}
    edit-mode: "replace"
    body: |
      <!--- comment-identifier -->
      The information is: {{ steps.output_information.outputs.information }}

# If the output_information step generates nothing, we still need to
# update the comment to remove the information posted in previous runs.
- name: Remove deprecated comment
  id: remove_deprecated_comment
  if: steps.output_information.outputs.comment != 'true' && steps.find_comment.outputs.comment-id != ''
  uses: peter-evans/create-or-update-comment@v2
  with:
    issue-number: ${{ github.event.pull_request.number }}
    comment-id: ${{ steps.find_comment.outputs.comment-id }}
    edit-mode: "replace"
    # The comment must include a unique identifier so that the
    # comment can be located by the find_comment step.
    # It must match the one in the comment body.
    body: |
      <!--- comment-identifier -->
      The information is no longer relevant.
```

This example is modified from a real use case at [Airbyte](https://github.com/airbytehq/airbyte/blob/v0.40.25/.github/workflows/report-connectors-dependency.yml). You can see that this is overly complicated, not to mention that they only work for one GitHub job. Things will be even worse if there is a need to aggregate information from multiple jobs.

In contrast, here is the equivalent Stoat config, action, and template:

```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
comment_template_file: ".stoat/template.hbs"
tasks:
  post-comment:
    json:
      # The post-comment step is supposed output a JSON file
      # with the information that we want to post to the PR.
      path: output.json
```

```yaml title=".github/workflows/post-comment.yaml"
- name: Run Stoat Action
  uses: stoat-dev/stoat-action@v0
  if: always()
```

```yaml title=".stoat/template.yaml"
# The template references the Stoat task defined in the config file.
The information is: {{ tasks.post-comment.json.value.information }}
```

So four GitHub action steps are replaced with the one Stoat action. Even better, the same Stoat config and template can be reused for all the Stoat tasks.
