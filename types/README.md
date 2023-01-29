# Stoat Types

## Publish New Version

```sh
npm publish --dry-run
npm publish
````

## Build

The build process does the following:
- Generate Typescript interfaces from JSON schema (`gen-types`).
- Transpile Typescript to Javascript and create type declarations (`tsc`).
