---
sidebar_position: 5
---

# Local Previews

:::tip

Local mode doesn't send any of your code or build artifacts off of your computer!
This is safe to run for private repos before we add support for authenticating our static hosting endpoints.

:::

To preview your comment locally:
```
stoat local
```

This requires that Stoat is already configured for the Git repo. Keep in mind that Stoat does not send any build data to the Stoat server and doesn't pull in any metric/build data from the server in local mode.
This comment preview is purely based on the current contents of the local files in your Git repo. You will need to run your build to generate any
artifacts you hope to display.
