# Unlock docs

This website (https://docs.unlock-protocol.com/) is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Deployments are performed automatically by Github.

## Updating docs

The docs are using markdown and can be [updated in the repo](https://github.com/unlock-protocol/docs/tree/master/docs).

### Auto-generated docs

Some of the docs are automatically generated.

#### Smart contracts

The docs are generated from the `@unlock-protocol.com/contracts` package.
You can modify any `.sol` file in the package following the [`hardhat-dodoc`](https://www.npmjs.com/package/@primitivefi/hardhat-dodoc) format.
Once ready, you can easily open a pull request on the docs repo (make sure you also generate a PR for the mono repo or your changes will be overwritten by the next doc update) by using the following script: `scripts/docs-contracts-pr.sh` executed at the root of the monorepo.

## Search

We use algolia docs search on the docs site. Once every day, the algolia crawlers re-indexes our site with new entries. This can be changed from the [algolia crawler dashboard](https://crawler.algolia.com/admin/crawlers/). You should be able to trigger manual re-indexing from the same.
