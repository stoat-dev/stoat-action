---
sidebar_position: 108
title: Video Previews
---

# Preview generated videos in PRs

Stoat can help you preview videos generated as part of your build in a comment on your pull request. In the future you
will be able to compare versions of a video with previous versions or the version in your `main` branch.

:::tip

If you convert your video to a GIF smaller than 10mb, you can use our [image preview tutorial](./preview-images) 
to learn how to embed the video directly in the Stoat comment as an image.

:::

## Adding videos to the Stoat comment

1. Set up Stoat with our [getting started guide](../installation).

2. Make sure the [Stoat Action](https://github.com/stoat-dev/stoat-action) appears after the GitHub workflow step that generates your video.

    ```yaml title=".github/workflows/your-workflow.yaml"
    # existing step in your repo that generates an video
    - name: Build
      run: ./your-build-script.sh

    - name: Run Stoat Action
      uses: stoat-dev/stoat-action@v0
      if: always()
    ```

3. Point Stoat at the generated video's path by adding a new task that uses the `static_hosting` plugin:

    ```yaml title=".stoat/config.yaml"
    ---
    version: 1
    enabled: true
    tasks:
      your-video-preview-id:
       static_hosting:
         path: path/to/video.mp4
    ```

   If you create a pull request, you should now have a link to the generated video in the Stoat comment after the build completes.

## Example Repo

See a real build that generates a video of a browser test with [Cypress](https://www.cypress.io/) and links to the video in a Stoat comment in [this pull request](https://github.com/stoat-dev/example-javascript/pull/1).
