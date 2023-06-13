![Unlock](/unlock-protocol-com/public/images/unlock-word-mark-dark.png#gh-dark-mode-only)
![Unlock](/unlock-protocol-com/public/images/unlock-word-mark.png#gh-light-mode-only)

---

This repository includes all the code deployed by Unlock, including smart contracts and the web app running at [unlock-protocol.com](https://unlock-protocol.com).

> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

Read more about [why we're building Unlock](https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Demo

[You can try Unlock using the Ethereum blockchain on our homepage.](https://unlock-protocol.com/)

We are building this in the open, which means you can also run the code locally (see instructions below).
You can try out the staging version - which runs the latest, in-progress code, but against the Goerli test network.

## Contributing

Thanks for your interest in contributing to Unlock! We're excited you're here. There are a variety of ways to contribute to the project.
Please read more about contributing in our [contributor guide](https://github.com/unlock-protocol/unlock/wiki/Getting-Started). Please also check our [code of conduct](https://github.com/unlock-protocol/unlock/blob/master/CODE_OF_CONDUCT.md) for all participants in our community.

## Getting started

### The code

Unlock uses a monorepo which includes all the services and applications we develop.

```
# get the code
git clone https://github.com/unlock-protocol/unlock
cd unlock
```

You'll need [yarn](https://yarnpkg.com) installed globally.

```
yarn
# install all dependencies (...may take a while)
```

Build all packages:

```
yarn build
```

To execute commands inside the repo, we use the pattern `yarn workspace <workspace name> <command>`

```
# build the contracts
yarn workspace @unlock-protocol/smart-contracts build

# validate lint for paywall
yarn workspace @unlock-protocol/paywall lint

# etc.
```

### The protocol

You can run a local version of the protocol using [Docker](https://docs.docker.com/install/).

```
cd docker && docker-compose up --build
```

This will create the required infrastructure (database, local ethereum test network, subgraph...) and start core services such as the [Locksmith](./locksmith) API and a [Wedlocks](./wedlocks) mailing service for debug purposes.

NB: config is defined in both `docker-compose.yml` and `docker-compose.override.yml`.

### Deploy and provision the contracts

The following script will deploy the contracts, create some dummy locks and send you some local tokens for development.

```
cd docker
docker-compose exec eth-node yarn provision
```

### Run one of the app

The main dashboard lives in the `unlock-app` folder of this repo.

To launch it locally:

```
# install deps
yarn

# start Unlock main app
yarn workspace @unlock-protocol/unlock-app start
```

This will start

- `http://localhost:3000/locks` to start using the application and deploy locks locally.
- `http://localhost:3002` our static landing page site.

## Secrets

Secrets are stored in the Unlock Labs 1Password account in the `API & Services` Vault. They can be loaded in our Github Actions through the use of dedicated actions.

Here is an example:

```yaml
steps:
  - name: Load secrets from 1Password
    uses: 1Password/load-secrets-action@v1.2.0
    with:
      export-env: true
    env:
      OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
      USERNAME: op://API & Services/hello-world/username
      CREDENTIAL: op://API & Services/hello-world/credential
  - name: Print masked secret for debugging purposes
    run: echo "Secret $USERNAME => $CREDENTIAL"
```

These reference URIs have the following syntax:
`op://<vault>/<item>[/<section>]/<field>`
So for example, the reference URI op://app-cicd/aws/secret-access-key would be interpreted as:
Vault: app-cicd
Item: aws
Section: default section
Field: secret-access-key

## Thank you

[<img src="https://user-images.githubusercontent.com/624104/52508260-d0daa180-2ba8-11e9-970c-3ef9596f6b4e.png" alt="BrowserStack Logo" width="120">](https://www.browserstack.com/)

Thanks to [BrowserStack](https://www.browserstack.com/) for providing the infrastructure that allows us to test in real browsers.

Thank you to all the Members of our lock as well!
You can easily join this list by clicking on the ❤️ Sponsor button (it's free!) at the top of this page too.

![Members](https://member-wall.unlock-protocol.com/api/members?network=137&locks=0xb77030a7e47a5eb942a4748000125e70be598632&maxHeight=300)
