---
sidebar_position: 2
---

# Templating

When rendering pull request comments, Stoat uses a [Handlebars](https://handlebarsjs.com/) template.
This template is used to produce [GitHub markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) that will be written to a Stoat GitHub comment.

Unless a custom Handlebars template file is specified by the `comment_template_file` in the Stoat config file `.stoat/config.yaml`,
a default template is used.

The current default template displays a table of [hosted static build outputs](./static-hosting) and [build runtime history](../tutorials/build-runtimes):
```hbs
{{{ views.plugins.static_hosting.github.table }}}
{{{ views.plugins.job_runtime.github.chart }}}
```

The current default template is also available via our API under the template field: [https://www.stoat.dev/api/templates?stoatConfigVersion=1](https://www.stoat.dev/api/templates?stoatConfigVersion=1)

## Modifying the comment template

For this tutorial, let's first add a line of text that says "Hello World" at the top of a Stoat PR comment.

Create `.stoat/template.hbs` with the following contents:
```hbs title=".stoat/template.hbs"
Hello World!

{{{ views.plugins.static_hosting.github.table }}}
{{{ views.plugins.job_runtime.github.chart }}}
```

The Stoat config file must now point to this new template file. Here's an example of `.stoat/config.yaml`:
```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
comment_template_file: ".stoat/template.hbs"
```

Note that the `comment_template_file` takes the full path from the root of the repo.

Now, if you create a PR with these two new changes, the comment will include `Hello, World!` at the top! 

## What data is available?

The input to the Handlebars template is a JSON object that is the result of a merge of the JSON form of the Stoat config file
and JSON objects produced by the execution of various Stoat plugins (`static_hosting`, `json`, and `job_runtime`).
The JSON schema of the full object used after processing for templating is [available on our GitHub repo here](https://github.com/stoat-dev/stoat-action/blob/main/src/schemas/stoatConfigSchemaRendered.json).

The easiest way to see what data is available for your comment is to click on the "debug" button on the comment and look at the "rendered config". 
This config contains the actual data used as input for the Handlebars template.

## Using custom data in a template

See our [aggregation user guide](./aggregation) for more information on how to incorporate arbitrary JSON into your rendering process.
