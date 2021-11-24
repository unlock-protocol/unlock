---
title: "Smart Contract Upgrade: Version 1.2"
subTitle: We shipped a large upgrade to our Unlock contract and the new locks have new features!
authorName: Julien Genestoux
publishDate: January 10, 2020
description: We wanted to start the year with a big release, so we shipped a very large upgrade (the largest since June 2018) to our smart contracts. This new version brings a ton of new features which will eventually bubble up to the Unlock user interfaces (and beyond!).
image: /images/blog/version-1-2/smart-contract-1-2.jpg
---

We wanted to start the year with a big release, so we shipped a very large upgrade (the largest since June 2018) to our smart contracts. This new version brings a ton of new features which will eventually bubble up to the Unlock user interfaces (and beyond!).

# The Unlock Contract

Let's start with a quick reminder about the architecture behind our smart contracts. First, there is the `Unlock` contract. It's a factory contract, whose main job is to deploy locks for creators. This contract is _currently_ owned by us, at Unlock Inc, through the use of a multi-sig contract (powered by [Gnosis](https://gnosis.io/)), but our hope is that eventually, it can be co-owned by the whole Unlock community.

The `Unlock` contract is upgradable by its owner. This means we can add features to make it more useful. We can also change some of its behavior. For this, we use [ZeppelinOS](https://openzeppelin.com/sdk/) and their proxy approach. The contract at the address `0x3d5409cce1d45233de1d4ebdee74b8e004abdd13` (or `unlock-protocol.eth`) is what is called a _proxy_ contract (See [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967)). Its purpose is to keep track of its internal data (like any smart contract), as well as of the actual _implementation_ which can alter this data. The process to upgrade is fairly strict but guarantees that it will never overwrite any of the past data, while still allowing the addition of new features.

If you want to explore Unlock, Etherscan provides a [great interface](https://etherscan.io/address/0x3d5409cce1d45233de1d4ebdee74b8e004abdd13#code).

![Etherscan](/images/blog/version-1-2/etherscan.png)

## The Proxy

First, you can see that you can actually interact with both the proxy, as well as the implementation directly. The proxy part offers the ability to `upgradeTo` a new version (by proving the address of the new implementation), `upgradeToAndCall` which does the same but also invoke a custom function right after the upgrade, or `changeAdmin` which would change the admin. All of these functions can only be called by the admin: don't waste gas calling them yourself!

As of last Monday, the [proxy's admin](https://etherscan.io/address/0x79918A4389A437906538E0bbf39918BfA4F7690e) [upgraded the implementation](https://etherscan.io/tx/0x358335670ef14c1deb72b3711eb0dd629ebb3801f1aa2b64a4feb04df00dc139) to use a new one, [deployed at this address](https://etherscan.io/address/0xe36793f0b4db71ff0a5216412f80ba89b2927445).

## Unlock

More importantly, you can interact with the Unlock smart contract itself. For example, you can view view [the owner of the Unlock contract](https://etherscan.io/address/0xa39b44c4affbb56b76a1bf1d19eb93a5dfc2eba9), the global token symbol for all NFT: `KEY` or even the current version of the Unlock contract (we use `5` internally and `1.2` externally).

Another very important element that you can view is the _Gross Network Product_ which is the total sum of ethereum spent to purchase lock keys, as long as the key was priced in Eth, DAI, SAI or BAT. We use Uniswap to get a price feed when we need to convert to Ether, but that's for another post ;) Measuring the Gross Network Product is a critical piece of the [Unlock Discount Token](https://github.com/unlock-protocol/unlock/wiki/The-Unlock-Discount-Tokens) model that we are working on to incentivize membership referrals.

By using Etherscan you can also deploy locks, without having to go through [our Dashboard](https://app.unlock-protocol.com/dashboard/), using the `createLock` method directly. The new version deployed on Monday uses the new Ethereum `create2` and leverages [eip-1014](https://eips.ethereum.org/EIPS/eip-1014) under the hood. This allows creators to deploy locks at only 15% of the cost that it took before that! In order to achieve this, we had to deploy a so [called `template` contract](https://etherscan.io/address/0x2d5487420fbeb5ba74eadf51084d4f71e1733983) which provides the reference implementation for locks to leverage.


# The new public locks

I want to repeat that old the **locks deployed before Monday have stayed absolutely unchanged**. It is actually impossible to change them. Once deployed, their code cannot be altered. This is a very important part of the "decentralization promise" that we make to creators: nobody will be able to change the terms of their memberships, but them.

However, if someone deploys a lock now, it comes with new features and improvements. Here are a few of the most exciting ones.

## On Key Sold hook

We strongly believe that one of the most important benefits of building on Ethereum is the **composability**. In practice, this is the ability for contracts to interact for the benefits of users. For example, purchasing a key using an ERC20 is an example of composability. Now, with hooks, the lock owner can define what other contracts will be able to run when a key has been sold.

Why is this useful? Here are 2 of my favorite examples:

1. _Matching donations_: someone could agree to match donations so that for any key purchase on a donation lock, they would make a payment to the lock as well. The "matching" contract could even query the lock itself to know how many keys have been sold and make a quadratic matching!

2. _A bonded curve lock_: a hook could increase the price of keys on a lock based on how many keys have been sold in the past. This can create bonding curves where early members end up paying less than late members, while also having the ability to re-sell their early membership at a higher price. You can easily use a lock as a [Token Curated Registry](https://medium.com/@ilovebagels/token-curated-registries-1-0-61a232f8dac7) where only members of the lock can change the data of the registry!

In practice, there are endless possibilities here and we cannot wait to see what people are building.

## Full refunds

This has been a request by the [EthGlobal](https://unlock-protocol.com/blog/ethwaterloo-tickets/) team: they wanted the ability to easily refund all participants to the hackathon, if they checked-in. Until then, it required a 2 step process, where the lock owner would have to withdraw the funds from the lock and then send them to the participants from their own address. Now, it can be done through the lock itself, making refunds very easy ;)

## Risk Free trials

The keys to a lock can be "burned" by their owner, triggering a pro-rated refund, based on how long the key has been used. Lock creators now have a way to define a period during which the key owner can request a _full refund_, making risk free trials possible.

## Tips

When we introduced our donation locks, several users asked us about the ability to "pay more" than the required price. Up until now, it was actually not possible to submit the actual amount that a consumer wants to pay for a membership key. With this new version, whoever purchases a key actually submits the amount they want to pay (greater than or equal to the price set by the creator).

## Partial sharing

I am very excited about this one: partial sharing of a membership. [Unlock keys are non-fungible](/blog/non-fungible-tokens-betaworks/), but... they are time based, and you can now split a membership and send some of your time to someone else! This has a lot of very interesting implications. For example, members can now share "paywall-ed" links along with a few minutes worth of memberships, in order to let someone else read the content!

# Building on top of Unlock

Our smart contracts are the "lowest" point of integration. Once a lock has been deployed, its functionality is immutable, which means that other application can start integrating with it in a safe way as it's API will never change. We publish npm modules which include interfaces to our smart contracts. Here is our [npm module for version 1.2](https://www.npmjs.com/package/unlock-abi-1-2). It's the "raw" API for locks of that version.

We also publish [unlock-js](https://www.npmjs.com/package/@unlock-protocol/unlock-js) which is another npm module. This one provides a higher level abstraction for all locks, while also having currently less granularity. It abstracts away versions, which means that it can be used to interact with any lock, regardless of its version.

Like always, [all of our code is open source](https://github.com/unlock-protocol/unlock/), and we take pull requests, as well as [grant bounties](https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3A%F0%9F%92%B0gitcoin) to people who help us move forward!










