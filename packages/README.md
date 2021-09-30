# Packages

Packages in this folder are shared accross multiple apps in this (mono)repo.

## Howto

Each package has its own logic. Some batch commands affecting all packages are available from the root repo (in the main `package.json`).


```sh
# remove existing dist/build folders
yarn packages:clean

# build them all
yarn packages:build
```

## Publish packages

We rely on [yarn release workflow](https://yarnpkg.com/features/release-workflow) to version and publish our packages.

### Versions

Yarn use "deffered" version release, which means that we first prepare a file that state which packages should be updated - and how (minor, major, etc). Then the new version number is applied to the package and updated in deps accross the entire repo.

Shortcuts commands available from the root repo:

```
# bump minor
yarn packages:version minor

# bump major
yarn packages:version major

# apply the release
yarn version:apply

# goodies: patch versions directly
yarn bump
```

NB: You can automatically check if files have changed and if new version number should be applied

```
yarn version:check
```

## Publish to npm

NB: packages where ```js private: true``` is set in `package.json` won't be published.

```
yarn publish
```