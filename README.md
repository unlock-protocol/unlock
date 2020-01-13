![Unlock](https://raw.githubusercontent.com/unlock-protocol/unlock/master/unlock-app/src/static/images/unlock-word-mark.png)

---

This repository includes all the code deployed by Unlock, including smart contracts and the web app running at [unlock-protocol.com](https://unlock-protocol.com).

> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

Read more about [why we're building Unlock](https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://circleci.com/gh/unlock-protocol/unlock.svg?style=svg)](https://circleci.com/gh/unlock-protocol/unlock)

## Demo

[You can try Unlock using the Ethereum blockchain on our homepage.](https://unlock-protocol.com/)

We are building this in the open, which means you can also run the code locally (see instructions below).
You can try out the staging version - which runs the latest, in-progress code, but against the Rinkeby test network - at [https://staging.unlock-protocol.com](https://staging.unlock-protocol.com).

Finally, you can learn more [on our documentation wiki](https://github.com/unlock-protocol/unlock/wiki).

## Contributing

Thanks for your interest in contributing to Unlock! We're excited you're here. There are a variety of ways to contribute to the project.
Please read more about contributing in our [contributor guide](https://github.com/unlock-protocol/unlock/blob/master/CONTRIBUTING.md). Please also check our [code of conduct](https://github.com/unlock-protocol/unlock/blob/master/CODE_OF_CONDUCT.md) for all participants in our community.

## Getting started

We use [docker](https://docker.com/) to run a set or containers which provide the required infrastructure.

1. Check out the code from this repository

Unlock uses a mono repo which includes all the services and applications we develop.

```
git clone https://github.com/unlock-protocol/unlock
cd unlock
```

2. Install all dependencies

This will install all dependencies required for all the Unlock components (smart contracts and react app). You'll need [yarn](https://yarnpkg.com) installed globally.

```
yarn
```

3. Set up your environment variables

At the root of the repo, add a file called `.env.dev.local` which includes the following variables and add your wallet address to the first line:

```
ETHEREUM_ADDRESS=<your ethereum address>
READ_ONLY_PROVIDER=http://localhost:8545
LOCKSMITH_URI=http://localhost:8080
WEDLOCKS_URI=http://localhost:1337
DASHBOARD_URL=http://localhost:3000
PAYWALL_URL=http://localhost:3001
PAYWALL_SCRIPT_URL=http://localhost:3001/static/paywall.min.js
UNLOCK_STATIC_URL=http://localhost:3002
UNLOCK_TICKETS_URL=http://0.0.0.0:3003
ERC20_CONTRACT_SYMBOL=DAI
ERC20_CONTRACT_ADDRESS=0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9
BOOTSTRAP_AMOUNT=15.0
HTTP_PROVIDER_HOST=127.0.0.1
HTTP_PROVIDER_PORT=8545
LOCKSMITH_PURCHASER_ADDRESS=0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a
```

Make sure you change the value of `ETHEREUM_ADDRESS` to use your main Ethereum address (the one you use with your Metamask for example).
This will let you interract with the application using your regular setup.

4. Run the docker cluster.

Once [docker has been installed](https://docs.docker.com/install/) on your machine, start the cluster:

```
$ cd docker && docker-compose up --build
```

This cluster includes all the required "infrastructure" to run our apps locally (mostly ganache, which is an ethereum dev node.)
When starting this script does several things: deploys the unlock smart contract, transfers eth to your address, ... etc

5. Run the app

This applies to any of our applications, but we'll take `unlock-app` as an example as it is our "main" dashboard:

```
cd unlock-app && yarn dev
```

## Thank you

[<img src="https://user-images.githubusercontent.com/624104/52508260-d0daa180-2ba8-11e9-970c-3ef9596f6b4e.png" alt="BrowserStack Logo" width="120">](https://www.browserstack.com/)

Thanks to [BrowserStack](https://www.browserstack.com/) for providing the infrastructure that allows us to test in real browsers.

Thank you to all the Members of our lock as well!
You can easily join this list by clicking on the ❤️ Sponsor button (it's free!) at the top of this page too.

![Members](https://member-wall.julien51.now.sh/api/members?locks=0xB0114bbDCe17e0AF91b2Be32916a1e236cf6034F&maxWidth=1000)
