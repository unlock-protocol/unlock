---
title: Unlock Releases PublicLock v12 Smart Contract
subTitle: New capabilities and improvements come to Unlock’s template smart contract for managing memberships.
authorName: Clément Renaud
publishDate: October 20, 2022
description: New capabilities and improvements come to Unlock’s template smart contract for managing memberships.
image: /images/blog/lock-v12-release/lock-v12-release-share.png
---

We are pleased to announce that a new version of the Unlock protocol template contract is now available. 

### Whats is the PublicLock template?

In the Unlock Protocol, a “lock” is a standalone smart contract that can issue (mint) and manage membership NFTs (”keys”). Once deployed, each lock exists as an entirely separate and independent contract. Even if the protocol changes, lock contracts remain as they were when created. Since version 10, a lock can be [upgraded](./upgradeable-patterns) to a newer version which may change some of the features, without affecting the existing data. 

Each new lock created is a “copy” of the main template contract, called `PublicLock`. The template contract defines the inner workings and the logic (functions, variables, etc.) of each new lock contract that is deployed. The template evolves as new use cases and features are added to the protocol.

### What changed in v12?

The version 12 contract consolidates the new features and approaches that were introduced in versions 10 and 11. The various features to set metadata (name, symbol and tokenURIs) have been regrouped into a single function called `setLockMetadata`. The configuration for a key’s default duration and available quantity (both per user and in aggregate) have also been grouped in a single `updateLockConfig` function. Additionally, several events are now fired when changes to the contract state are made — so those events are now easier to track using our [new subgraph](./subgraph-v2). Also, version 12 contains bug fixes related to locks with cancelled keys. 

You can see a full list of related [issues and pull requests](https://github.com/unlock-protocol/unlock/issues?q=+label%3A%22publicLock+v12%22+) here.

### How to deploy or upgrade an existing smart contract

The version 12 template has been published and will soon be available as the default version for all new locks. Meanwhile, you can upgrade an existing version 11 lock by using the `upgradeLock` function from the Unlock factory contract. (To determine the current version of your lock, please check the `publicLockVersion` of your lock in your block explorer.)

As always, if you have any questions, please reach out for us on Discord and we’ll be happy to help you with the upgrade!

**Implementation note:** Version upgrades are only permitted to bump a single digit at a time. For example, if you have a v10 lock, you will have to upgrade first to v11, and then to v12.