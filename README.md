![Unlock](https://raw.githubusercontent.com/unlock-protocol/unlock/master/unlock-app/src/static/images/unlock-word-mark.png?sanitize=true)

---

This repository includes all the code deployed by Unlock, including smart contracts and the web app running at https://unlock-protocol.com.

> Unlock is an access control protocol built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

Read more about [why we're building Unlock](https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://travis-ci.com/unlock-protocol/unlock.svg?branch=master)](https://travis-ci.com/unlock-protocol/unlock) [![Greenkeeper badge](https://badges.greenkeeper.io/unlock-protocol/unlock.svg)](https://greenkeeper.io/)

## Demo

We recorded a screencast to show how Unlock works for a paywall.

[![Demo Unlock](https://img.youtube.com/vi/wktotzmea0E/0.jpg)](https://www.youtube.com/watch?v=wktotzmea0E)

## Contributing

We strongly recommend that the community help us make improvements and determine the future direction of the protocol. To report bugs within this package, please create an issue in this repository.

## Getting started

1. Check out the code from this repository

```
git clone https://github.com/unlock-protocol/unlock
cd unlock
```

2. Install all deps

First, install ganach-cli which is a "mock" blockchain node. We are using the latest dev version.

```
$ npm install -g ganache-cli@trufflesuite/ganache-cli#develop
$ npm run install-deps
```

3. Run the app (this should also compile and deploy the smart contract to a local truffle node)

```
cd unlock-app && npm run dev
```

## Code

### Smart Contract

Includes the code for smart contracts: Lock and Unlock.

### unlock-protocol.com

A static site for unlock-protocol.com. Will eventually be deprecated in favor of code deployed from unlock-app.

### unlock-app

The code for the React app which interfaces with the deployed smart contracts.

## Running tests/ci

We deploy with docker/docker-compose:

```
docker-compose -f docker/docker-compose.ci.yml build
docker-compose -f docker/docker-compose.ci.yml up --abort-on-container-exit
```
