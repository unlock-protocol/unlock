![Unlock](https://raw.githubusercontent.com/unlock-protocol/unlock/master/unlock-app/src/static/images/unlock-word-mark.png?sanitize=true)

---

This repository includes all the code deployed by Unlock, including smart contracts and the web app running at https://unlock-protocol.com.

> Unlock is an access control protocol built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

Read more about [why we're building Unlock](https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://travis-ci.com/unlock-protocol/unlock.svg?branch=master)](https://travis-ci.com/unlock-protocol/unlock) [![Greenkeeper badge](https://badges.greenkeeper.io/unlock-protocol/unlock.svg)](https://greenkeeper.io/)

## Demo

We recorded a screencast to show how Unlock works for a paywall. (Note: this video is a few months old and outdated but still shows the "user flow" pretty accurately.)

[![Demo Unlock](https://img.youtube.com/vi/wktotzmea0E/0.jpg)](https://www.youtube.com/watch?v=wktotzmea0E)

We are building this in the open, which mean you can run the code locally (see instructions below).
You could also try out the staging version - which runs the latest, in-progress code - at https:://staging.unlock-protocol.com.

## Contributing

Thanks for your interest in contributing to Unlock! We're excited you're here. There are a variety of ways to contribute to the project.
Please read more about contributing on this [dedicated document](https://github.com/unlock-protocol/unlock/blob/master/CONTRIBUTING.md). Please, also check our [code of conduct](https://github.com/unlock-protocol/unlock/blob/master/CODE_OF_CONDUCT.md).

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

## Running tests/ci

We deploy with docker/docker-compose:

```
docker-compose -f docker/docker-compose.ci.yml build
docker-compose -f docker/docker-compose.ci.yml up --abort-on-container-exit
```
