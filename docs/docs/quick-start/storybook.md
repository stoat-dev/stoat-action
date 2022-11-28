# Storybook

Follow these steps to generate Storybook previews for each pull request.

1. Install the [Stoat App](https://github.com/apps/stoat-app).

2. Append the [Stoat Action](https://github.com/stoat-dev/stoat-action) at the end of the GitHub workflow that generates a Storybook build. For example:

    ```yaml
    # existing step in your repo that generates a static Storybook build
    - name: Build Storybook
      run: |
        npm install
        npm run build-storybook

    - name: Run Stoat Action
      uses: stoat-dev/stoat-action@v1
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
          # an arbitrary name for the Storybook task
          name: "Storybook"
        static_hosting:
          # path to the Storybook build
          path: storybook-static
    ```

    By default, the `build-storybook` script will generate a static Storybook in the `storybook-static` directory (documentation [here](https://storybook.js.org/tutorials/intro-to-storybook/react/en/deploy)). This is the directory to set for the `path` field in the Stoat config file.

That's it. Now, every time you open a pull request, Stoat will host the Storybook build and post a comment with a link to the preview. See an example in [this pull request](https://github.com/stoat-dev/examples/pull/1).

![screen shot](https://user-images.githubusercontent.com/1933157/204390272-50819944-71bf-4037-b63f-5514c5c04edd.png)
