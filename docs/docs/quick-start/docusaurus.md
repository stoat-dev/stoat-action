# Docusaurus

Follow these steps to generate Docusaurus previews for each pull request.

1. Install the [Stoat App](https://github.com/apps/stoat-app).

2. Append the [Stoat Action](https://github.com/stoat-dev/stoat-action) at the end of the GitHub workflow that generates a Docusaurus build. For example:

    ```yaml title=".github/workflows/docs.yaml"
    # existing step in your repo that generates a static Docusaurus build
    - name: Build Docusaurus
      run: |
        npm install
        npm run build

    - name: Run Stoat Action
      uses: stoat-dev/stoat-action@v1
      if: always()
    ```

3. Create a `.stoat` directory and add a Stoat config file `config.yaml`:

    ```yaml title=".stoat/config.yaml"
    ---
    version: 1
    enabled: true
    tasks:
      docusaurus:
        metadata:
          # an arbitrary name for the Docusaurus task
          name: "Documentation"
        static_hosting:
          # path to the Docusaurus build
          path: build
    ```

   By default, the `build` script will generate static Docusaurus pages in the `build` directory (documentation [here](https://docusaurus.io/docs/deployment)). This is the directory to set for the `path` field in the Stoat config file. It should be adjusted according to your configuration.

That's it. Now, every time you open a pull request, Stoat will host the Docusaurus build and post a comment with a link to the preview. See an example in [this pull request](https://github.com/stoat-dev/stoat-action/pull/12).

![screen shot](https://user-images.githubusercontent.com/1933157/204400790-95dcc777-f0eb-4225-af52-3c7424b5dc81.png)
