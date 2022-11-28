# Storybook

To generate Storybook previews for each pull request, follow these steps:

1. Install the [Stoat App](https://github.com/apps/stoat-app).

2. Add the [Stoat Action](https://github.com/stoat-dev/stoat-action). Append the action at the end of the GitHub workflow that generates a Storybook build. For example:

  ```yaml
  - name: Build Storybook
    run: npm run build-storybook
  - name: Run Stoat Action
    uses: stoat-dev/stoat-action@latest
    if: always()
  ```

3. Add a Stoat config file at `.stoat/config.yaml`:

  ```yaml
  ---
  version: 1
  enabled: true
  plugins:
    storybook:
      metadata:
        # an arbitrary name for the Storybook preview
        name: "Storybook"
      static_hosting:
        # path to the Storybook build
        path: storybook-static
  ```

That's it. Now, every time you open a pull request, Stoat will host the Storybook build and post a comment with a link to the preview. See an example in [this pull request](https://github.com/stoat-dev/examples/pull/1).
