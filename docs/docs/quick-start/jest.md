# Jest

Follow these steps to generate Jest coverage report previews for each pull request.

1. Install the [Stoat App](https://github.com/apps/stoat-app).

2. Run Jest with coverage report, and append the [Stoat Action](https://github.com/stoat-dev/stoat-action) at the end of the relevant workflow. For example:

    `jest.config.js`
    ```js
    module.exports = {
      // ...
      collectCoverage: true,
    };
    ```

    `.github/workflows/test.yaml`
    ```yaml
    # existing step in your repo that runs Jest
    - name: Run Tests
      run: |
        npm install
        npm run jest --coverage

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
      jest:
        metadata:
          # an arbitrary name for the Jest task
          name: "Jest Coverage"
        static_hosting:
          # path to the Jest coverage report
          path: coverage/lcov-report
    ```

   By default, Jest test with coverage will generate HTML report in the `coverage/lcov-report` directory (documentation [here](https://jestjs.io/docs/configuration#coveragereporters-arraystring--string-options)). This is the directory to set for the `path` field in the Stoat config file. It should be adjusted according to your configuration.

That's it. Now, every time you open a pull request, Stoat will host the Jest test coverage report and post a comment with a link to the report. See an example in [this pull request](https://github.com/stoat-dev/examples/pull/1).

![screen shot](https://user-images.githubusercontent.com/1933157/204403456-1e3dc522-a68c-41ee-a288-997451718eff.png)
