---
title: Unlock Now Available on Goerli Ethereum Testnet
subTitle: As Rinkeby is getting deprecated, the Unlock Protocol has now been deployed on the Goerli Ethereum Testnet for novice and developers to experiment
publishDate: Jul 29, 2022
authorName: Clément Renaud
description: As Rinkeby is getting deprecated, the Unlock Protocol has now been deployed on the Goerli Ethereum Testnet for novice and developers to experiment.
image: images/blog/goerli/goerli-logo.png
---

After years of loyal service, the Rinkeby test network is about to [retire](https://twitter.com/peter_szilagyi/status/1526065746165567488?s=20&t=DWU3cGfm2GNgCQlIyPIjMQ) and will no longer receive protocol upgrades. We have decided to redeploy our contracts on another testnet: [Goerli](https://goerli.net/).

## Why use a test network?

Testnets (for test networks) are alternative chains that are used exclusively for testing and development. They work exactly the same as the main networks, except their coins can be obtained for free, usually via online [faucets](https://goerli-faucet.mudit.blog/). Testnets allows risk-free experiments, which is great when you are a novice or experimenting at the latest edge of the crypto world. Before spending valuable tokens on costly contract deployments and operations, you better first try things first in an environment close to the "real-word" chains. The Mumbai testnet mimics Polygon, Korvan mimics Optimisim, and Goerli or Rinkeby mimics Ethereum Mainnet - without the costs.

## Why so many testnets?

With test coins being free, there is no economic incentives for miners to secure the test chains and these networks are often left vulnerable. Therefore designing, maintaining and running testnets pertains more to a labor of love of the developer community. Behind their mysterious names, each network has its own set of advantages and flaws. Some are quite unstable, other are stable but slow, some do not support specific Ethereum clients, some have too few active faucets, etc. Picking one always comes with its own set of drawbacks or tradeoffs.

## Why Goerli?

The Goerli (Görli) network is one of the main testing networks for Ethereum. It was created in 2018 during ETHBerlin to try to address the various flaws in existing testnets, by making it: *"both widely usable across all client implementations, and robust enough to guarantee consistent availability and high reliability"* (read the [original statement](https://dev.to/5chdn/the-grli-testnet-proposal---a-call-for-participation-58pf) for more). As today, it has become the most used test network and it's planned to be maintained [long term](https://ethereum.org/en/developers/docs/networks/). 

## Preparing for the Merge 

Like most testnets, Goerli uses a permissioned proof-of-authority consensus mechanism - where only a small number of chosen nodes can validate transactions and create new blocks. As [The Merge](https://ethereum.org/en/upgrades/merge/) is getting closer, Goerli testnet will be merged with the Prater beacon chain and transition to a full proof-of-stake network in the following weeks. The Goerli/Prater merge should happen on [Aug 10, 2022](https://etherworld.co/2022/07/16/goerli-and-prater-testnet-merge/). This will mark the end of the permissioned proof-of-authority phase and anyone will be able to run a validator for Goerli. For the end user, not much will change (hopefully!).

## Unlock Protocol on Goerli

The contracts for Unlock Protocol have been deployed on Goerli and you are able to create test locks from the online dashbaord, starting now. The Unlock main contract lives at the address [`0x627118a4fB747016911e5cDA82e2E77C531e8206`](https://goerli.etherscan.io/address/0x627118a4fb747016911e5cda82e2e77c531e8206). You can get Goerli test coins using a [faucet](https://fauceth.komputing.org/?chain=5) - you can also try [that one](https://goerlifaucet.com/). Goerli is an ideal environment to build custom logic for your lock, using for instance [contract hooks](https://docs.unlock-protocol.com/core-protocol/public-lock/hooks#register-a-hook). You can also check all [networks](https://docs.unlock-protocol.com/core-protocol/unlock/networks/) where Unlock has been been deployed. 

Now, time to build!

---

### More info about Goerli

- Chain/Network id: 5
- Native currency: ETH
- Block time: 15 seconds on average
- Status Dashboard: https://stats.goerli.net/
- Explorer https://goerli.etherscan.io/
- Github https://github.com/goerli/testnet
- Website https://www.goerli.net
