---
title: Scaffold-eth + Unlock
description: >-
  Tutorial on how to use the Unlock Protocol flavor of the scaffold-eth
  example repository.
---

# 🏗 Scaffold-eth + Unlock

## What is Scaffold-eth?

[Scaffold-eth](https://docs.scaffoldeth.io/scaffold-eth/) is a prototyping and learning tool meant to give developers a complete environment to build on Ethereum, although you can use it with any EVM network.

The stack includes [Solidity](https://docs.soliditylang.org/), [Hardhat](https://hardhat.org/), [React](https://reactjs.org/), [Ethers.js](https://docs.ethers.io/) and [Ant Design](https://ant.design/).

## Why it matters

We decided it would be useful to show people how Unlock Protocol could fit into that stack. So we put out a bounty and one of our community members [Danni Thomx](https://twitter.com/dannithomx) forked the scaffold-eth github repository and [scaffold-eth-unlock](https://github.com/unlock-protocol/scaffold-eth-unlock) was born.

Now you can use this repository to learn how Unlock can be used in a modern dApp or as a base to start prototyping your next killer dApp.

## What you need to know

### Scaffold-eth resources

You can find out everything you need to know about Scaffold-eth by checking out
their [docs](https://docs.scaffoldeth.io/), so we won't go into detail here about things which are already well covered there, but the following assumes you've already gotten at least a little bit familiar.

It's not necessary to do any of the [Speed Run Ethereum Challenges](https://docs.scaffoldeth.io/scaffold-eth/challenges/about-these-challenges) in order to simply get started with Unlock Protocol using this repository, but if you're new to blockchain development, it's a great way to get started!

### What is different

A few things were added in order to make the base Scaffold-eth repository work with Unlock Protocol.

#### Unlock specific packages

- [@unlock-protocol/contracts](https://www.npmjs.com/package/@unlock-protocol/contracts) package which is used to pass the contract ABIs to Ethers.js
- [@unlock-protocol/paywall](https://www.npmjs.com/package/@unlock-protocol/paywall) package which is used for tracking the state of NFT ownership to lock and unlock content in GatedNav and GatedContent components.

#### Unlock State Hook

[useUnlockState](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/hooks/useUnlockState.js) is a hook which can be used with your components to provide a state of `hasValidKey` and render the page differently or trigger the checkout dependent on that state.

#### Unlock Components

- [LockedNav Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedNav.jsx) uses the `useUnlockState` hook to lock a navigation menu.
- [LockedContent Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedContent.jsx) uses the `useUnlockState` hook to lock content, in this instance a display of the current network and another component that lets you deploy locks.
- [CreateLock Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/CreateLock.jsx) which can be used to deploy a basic lock contract.

### Getting started

Directions on running the repository are all in the README on the [github](https://github.com/unlock-protocol/scaffold-eth-unlock) repository, so we won't repeat those here. Here are some things you might want to do before you spin the project up.

#### Create a lock

The repo allows you to create locks, but you'll want to create one ahead of time to be able to configure it properly.

You can create one very easily straight from our dashboard app. Although we make it pretty simple, we created a ["How to Create a Lock"](https://unlock-protocol.com/guides/how-to-create-a-lock/) guide, just in case you need it.

You can also create one programmatically and we have a few tutorials with different ways you can do that.

- [Using Unlock.js](https://docs.unlock-protocol.com/tools/unlock.js#using-walletservice-to-deploy-a-lock)
- [Using Ethers.js](/tutorials/smart-contracts/ethers#deploying-new-membership-contract)
- [Using thirdweb](/tutorials/misc/thirdweb)

#### Grab your configuration JSON

This repository takes advantage of our [Paywall](/tools/checkout/paywall/), which is a JavaScript library that helps track whether a connected wallet has an Unlock membership NFT and provides state for that and the ability to invoke our [Checkout](/tools/checkout/) app. The [Checkout](/tools/checkout/) is modal where people can purchase (lazy mint) an NFT, think of it like the Unlock version of the Stripe or Paypal checkout, it works very much the same way.

The easiest way to create a configuration json object is to head to the Dashboard where you'll find the [Checkout Builder](https://app.unlock-protocol.com/locks/checkout-urlDashboard) tool. You can also get there by clicking the "Generate URL" button from lock details page. After you're finished choosing your options on this page, you can click the "Download JSON" button. This tool helps you visualize what your checkout page will look like.

Of course, you can just manually create one too. The complete reference for that can be found in our [Checkout Configuration](/tools/checkout/configuration) documentation.

#### Start the repo

With all the configuration you need in hand, you'll be able to use the step-by-step directions in the repository to get it running.

### Things to try

While getting a fully functioning dApp that allows you to create NFT membership contracts ("Locks"), sell or mint NFTs ("Keys"), and token gate content based on ownership is pretty exciting on its own, here are some suggestions on other things you can try next.

- Create a component to lock video content based on our [LockedContent Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedContent.jsx)
- Create a SAAS app where access to the controls menu is locked until your subscription is purchased using our [LockedNav Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedNav.jsx)
- Create a blog where subscribers can pay for premium content. Show them a sneak peek and lock the rest using the [LockedContent Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedContent.jsx)
- Create a dApp that allows credential issuers to create digital versions of their licenses, certifications or diplomas using the [CreateLock Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/CreateLock.jsx). We have a specialized [contract management](/core-protocol/public-lock/access-control) system which can be used to make an NFT non-transferable by the owner but still revokable by the issuer.
