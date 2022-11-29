# JaCoCo

Follow these steps to generate JaCoCo coverage report previews for each pull request.

1. Install the [Stoat App](https://github.com/apps/stoat-app).

2. Run tests with JaCoCo coverage report, and append the [Stoat Action](https://github.com/stoat-dev/stoat-action) at the end of the relevant GitHub workflow. For example:

    ```gradle title="build.gradle"
    test {
      finalizedBy jacocoTestReport
    }

    jacocoTestReport {
      dependsOn test
      reports {
        html.destination file("$buildDir/reports/jacoco")
      }
    }
    ```

    ```yaml title=".github/workflows/build.yaml"
    # existing step in your repo that generates JaCoCo coverage report
    - name: Build and Test
      run: ./gradlew build jacocoTestReport

    - name: Run Stoat Action
      uses: stoat-dev/stoat-action@v1
      if: always()
    ```

3. Create a `.stoat` directory and add a Stoat config file `config.yaml`:

    ```yaml title=".stoat/config.yaml"
    ---
    version: 1
    enabled: true
    plugins:
      jacoco:
        metadata:
          # an arbitrary name for the JaCoCo task
          name: "JaCoCo Coverage"
        static_hosting:
          # path to the JaCoCo coverage report
          path: build/reports/jacoco
    ```

   By default, JaCoCo report is written to the `$buildDir/reports/jacoco` directory, which translates to `build/reports/jacoco` (documentation [here](https://docs.gradle.org/current/userguide/jacoco_plugin.html)). This is the directory to set for the `path` field in the Stoat config file. It should be adjusted according to your configuration.

That's it. Now, every time you open a pull request, Stoat will host the JaCoCo test coverage report and post a comment with a link to the report. See an example in [this pull request](https://github.com/stoat-dev/examples/pull/1).

![screen shot](https://user-images.githubusercontent.com/1933157/204403456-1e3dc522-a68c-41ee-a288-997451718eff.png)
