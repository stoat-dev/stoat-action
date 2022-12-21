---
sidebar_position: 3
---

# Aggregation

Stoat aggregates JSON data using the [deepmerge](https://www.npmjs.com/package/deepmerge) NPM package when creating a JSON
object used to render the [template](./templating).

The following is the order of objects merged together:
1. The JSON form of the latest Stoat config file
2. Partial configs that are produced as output from individual tasks.
   Here is an example partial config produced by a `app-test-coverage` task that configures the `static_hosting` plugin:
   ```json
   {
      "plugins": {
        "static_hosting": {
          "app-test-coverage": {
            "sha": "1848b03dd4b58c8f8485d51a2157af4904e4073f",
            "link": "https://stoat-dev--examples--1848b03--app-test-c-4590.stoat.page",
            "status": "✅"
          }
        }
      }
   }
   ```
   For a specific task id, only the latest commit's partial config will be merged.
3. Finally, the merged JSON object created so far can be used to produce aggregate `views` in the final JSON. This is how
   `{{{ views.plugins.static_hosting.github.table }}}` and other aggregate views are created.

In the future, Stoat will offer a more expressive schema that allows you to access other types of aggregate metrics where you can manage the manner of aggregation.

## Using custom JSON blobs for aggregation

The `json` Stoat plugin can be used to incorporate your own custom data as input for your template.

For example, let's say you output the seconds your build takes to a file at the root of your repo called `time.json`:
```json title="time.json"
{ "seconds": 55 }
```

After the build step that outputs that file, you include the Stoat action in your GitHub workflow:
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
plugins:
  json:
    time:
      path: time.json
```

Then let's edit the `.stoat/template.hbs` template file to only show the build time:
```
Build Time: {{#if plugins.json.time.value }}{{ plugins.json.time.value.seconds }} seconds{{else}}🔄{{/if}}
```

Note that we can't depend on the value being available instantly since the template can render before all required build steps complete, so
we check to see if the value exists and show a loading icon while we're waiting for the build.

If you commit these changes (with a build process that creates `time.json`) on a repo that [has Stoat installed](../installation), you will see the build time in the Stoat PR!

To see a working example of this for a Gradle build that also includes the static hosting table, see [this PR](https://github.com/stoat-dev/examples/pull/2/files).
