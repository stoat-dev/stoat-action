---
sidebar_position: 2
---

# Templating

When rendering PR comments, Stoat uses a [Handlebars](https://handlebarsjs.com/) template.
Which template file to use is specified by the optional `comment_template_file` key-value pair in `.stoat/config.yaml`.
If this file is absent, a default template is used. 

The current default template is set as:
```hbs
{{{ views.plugins.static_hosting.github.table }}}
```

The value of `views.plugins.static_hosting.github.table` is the GitHub Markdown for the rendered version of the following template:
```hbs
| Name | Link | Commit | Status |
| :--- | :--- | :--: | :-----: |
{{#each tasks}}
{{#if this.static_hosting.status ~}}
| **{{#if this.metadata.name}}{{{ this.metadata.name }}}{{else}}{{ @key }}{{/if}}** | [Visit]({{ this.static_hosting.link }}) | {{ this.static_hosting.sha }} | {{{ this.static_hosting.status }}} |
{{/if ~}}
{{/each}}
```

The current default template is also available via our API: [https://www.stoat.dev/api/templates?stoatConfigVersion=1](https://www.stoat.dev/api/templates?stoatConfigVersion=1)

## Modifying the comment template

For this tutorial, let's first add a line of text that says "Hello World" at the top of a Stoat PR comment.

Create `.stoat/template.hbs` with the following contents:
```hbs title=".stoat/template.hbs"
Hello World!

{{{ views.plugins.static_hosting.github.table }}}
```

All but the first two lines should be pulled from the [current default remote v1 template](https://www.stoat.dev/api/templates?stoatConfigVersion=1).

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

The input used to render the template is provided by Stoat itself or the plugins that have been configured to push data. 
The JSON schema of the data available for templating is [available on our GitHub repo here](https://github.com/stoat-dev/stoat-action/blob/main/src/schemas/stoatConfigSchemaRendered.json).

In the prior example, you can see that this output is read by iterating through plugins, checking if they use static hosting, and then outputting lines in a table based on the response.

## Using custom data in a template

What if you want to incorporate your own custom data as input for your template? The `json` Stoat plugin allows for this by giving the ability for a build step to 
output arbitrary JSON to a file and then use that file for templating. 

For this tutorial, let's say as part of your build, you output the seconds your build takes to a file at the root of your repo called `time.json`:
```json title="time.json"
{ "seconds": 55 }
```

After the build step that outputs that file, make sure to include the Stoat action:
```yaml
- name: Run Stoat Action
  uses: stoat-dev/stoat-action@v0
  if: always()
```

Modifying the `.stoat/config.yaml` file to include a task that uses the `json` plugin would look like this:
```yaml title=".stoat/config.yaml"
---
version: 1
enabled: true
comment_template_file: ".stoat/template.hbs"
tasks:
  time:
    json:
      path: time.json
```

Then let's edit the `.stoat/template.hbs` template file to only show the build time:
```
Build Time: {{#if tasks.time.json.value }}{{ tasks.time.json.value.seconds }} seconds{{else}}🔄{{/if}}
```

Note that we can't depend on the value being available instantly since the template can render before all required build steps complete, so
we check to see if the value exists yet.

If you commit these changes (with a build process that creates `time.json`), you will now see just the build time in the Stoat PR!

To see a working example of this for a Gradle build, see [this PR](https://github.com/stoat-dev/examples/pull/2/files) with an example of recording build times and adding them to the Stoat PR comment.
