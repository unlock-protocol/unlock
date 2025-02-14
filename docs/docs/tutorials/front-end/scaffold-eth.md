---

**title:** Scaffold-eth + Unlock  
**description:**  
Tutorial on how to use the Unlock Protocol flavor of the Scaffold-eth example repository.  

---

# 🏗 Scaffold-eth + Unlock

## What is Scaffold-eth?

[Scaffold-eth](https://docs.scaffoldeth.io/scaffold-eth/) is a prototyping and learning tool meant to give developers a complete environment to build on Ethereum, although you can use it with any EVM network.

The stack includes [Solidity](https://docs.soliditylang.org/), [Hardhat](https://hardhat.org/), [React](https://reactjs.org/), [Ethers.js](https://docs.ethers.io/), and [Ant Design](https://ant.design/).

## Why It Matters

We decided it would be useful to show people how Unlock Protocol could fit into that stack. So we put out a bounty, and one of our community members, [Danni Thomx](https://x.com/dannithomx), forked the Scaffold-eth GitHub repository, and [scaffold-eth-unlock](https://github.com/unlock-protocol/scaffold-eth-unlock) was born.

Now you can use this repository to learn how Unlock can be used in a modern dApp or as a base to start prototyping your next killer dApp.

## What You Need to Know

### Scaffold-eth Resources

You can find out everything you need to know about Scaffold-eth by checking out their [docs](https://docs.scaffoldeth.io/), so we won't go into detail here about things that are already well covered there. However, the following assumes you've already become at least a little familiar with it.

It's not necessary to complete any of the [Speed Run Ethereum Challenges](https://docs.scaffoldeth.io/scaffold-eth/challenges/about-these-challenges) to start using Unlock Protocol with this repository. However, if you're new to blockchain development, it's a great way to get started!

### What Is Different?

A few things were added to make the base Scaffold-eth repository work with Unlock Protocol.

#### Unlock-Specific Packages

- [@unlock-protocol/contracts](https://www.npmjs.com/package/@unlock-protocol/contracts): This package is used to pass the contract ABIs to Ethers.js.
- [@unlock-protocol/paywall](https://www.npmjs.com/package/@unlock-protocol/paywall): This package is used for checking the state of NFT ownership to lock and unlock content in the `GatedNav` and `GatedContent` components.

#### Unlock State Hook

[useUnlockState](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/hooks/useUnlockState.js) is a hook that can be used with your components to check whether the user has a valid key (`hasValidKey`) and render the page differently or trigger the checkout process depending on that state.

#### Unlock Components

- [LockedNav Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedNav.jsx): Uses the `useUnlockState` hook to lock a navigation menu.
- [LockedContent Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedContent.jsx): Uses the `useUnlockState` hook to lock content. In this instance, it displays the current network and another component that lets you deploy locks.
- [CreateLock Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/CreateLock.jsx): Can be used to deploy a basic lock contract.

### Getting Started

Directions for running the repository are provided in the `README` on the [GitHub](https://github.com/unlock-protocol/scaffold-eth-unlock) repository, so we won’t repeat them here. However, here are some things you might want to do before spinning up the project.

#### Create a Lock

The repository allows you to create locks, but you'll want to create one ahead of time to be able to configure it properly.

You can create one very easily straight from our dashboard app. Although we make it simple, we have a ["How to Create a Lock"](https://unlock-protocol.com/guides/how-to-create-a-lock/) guide just in case you need it.

You can also create one programmatically, and we have a few tutorials demonstrating different approaches:

- [Using Unlock.js](https://docs.unlock-protocol.com/tools/unlock.js#using-walletservice-to-deploy-a-lock)
- [Using Ethers.js](https://docs.unlock-protocol.com/tutorials/smart-contracts/ethers#deploying-new-membership-contract)
- [Using thirdweb](https://docs.unlock-protocol.com/tutorials/misc/thirdweb)

#### Grab Your Configuration JSON

This repository takes advantage of our [Paywall](https://docs.unlock-protocol.com/tools/checkout/paywall/), a JavaScript library that tracks whether a connected wallet has an Unlock membership NFT. It provides state for that and allows you to invoke our [Checkout](https://docs.unlock-protocol.com/tools/checkout/) app. The [Checkout](https://docs.unlock-protocol.com/tools/checkout/) is a modal where people can purchase (lazy mint) an NFT. Think of it as the Unlock version of the Stripe or PayPal checkout—it functions in a similar way.

The easiest way to create a configuration JSON object is to go to the Dashboard and use the [Checkout Builder](https://app.unlock-protocol.com/locks/checkout-urlDashboard) tool. You can also get there by clicking the "Generate URL" button on the lock details page. After choosing your options, click the "Download JSON" button. This tool helps you visualize what your checkout page will look like.

Of course, you can manually create one too. The complete reference for that can be found in our [Checkout Configuration](https://docs.unlock-protocol.com/tools/checkout/configuration) documentation.

#### Start the Repo

With all the necessary configuration in hand, you'll be able to follow the step-by-step directions in the repository to get it running.

### Things to Try

While getting a fully functioning dApp that allows you to create NFT membership contracts ("Locks"), sell or mint NFTs ("Keys"), and token-gate content based on ownership is already exciting, here are some additional ideas to explore:

- Create a component to lock video content based on our [LockedContent Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedContent.jsx).
- Create a **SaaS** app where access to the controls menu is locked until a subscription is purchased using our [LockedNav Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedNav.jsx).
- Create a blog where subscribers can pay for premium content. Show them a sneak peek and lock the rest using the [LockedContent Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/LockedContent.jsx).
- Create a dApp that allows credential issuers to create digital versions of their licenses, certifications, or diplomas using the [CreateLock Component](https://github.com/unlock-protocol/scaffold-eth-unlock/blob/master/packages/react-app/src/components/CreateLock.jsx). We have a specialized [contract management system](https://docs.unlock-protocol.com/core-protocol/public-lock/access-control), which can be used to make an NFT non-transferable by the owner but still revocable by the issuer.

---