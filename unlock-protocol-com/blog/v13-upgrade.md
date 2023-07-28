---
title: Unlock Protocol Smart Contracts Upgrade v13
authorName: Clément Renaud
publishDate: April 14, 2023
description: An updated version of Unlock’s core contract and a new template contract for managing memberships
image: /images/blog/v13/v13-cover.png
---

![v13-cover.png](/images/blog/v13/v13-cover.png)

We are pleased to announce that a **new version of the Unlock Protocol** is now available. These improvements and new capabilities are sure to make the Unlock Protocol even more powerful and user-friendly than before. We fixed a few bugs, added some gas optimisations and shipped a bunch of new features.

You can review the original conversation in the Unlock DAO community forum regarding these features [here](https://unlock.community/t/unlock-protocol-upgrade-proposal/368).

If you are a Lock Manager, you can upgrade your lock directly from the [Unlock Dashboard](https://app.unlock-protocol.com/locks). Remember, even though this new version is made available by us, we certainly cannot upgrade your locks. Only a lock manager can upgrade their lock(s)!

## A general upgrade of the base Unlock smart contracts

Unlock Protocol has recently undergone two important smart contract upgrades.

First, a new version of the [Unlock factory contract](https://docs.unlock-protocol.com/core-protocol/unlock/) has been released. This contract takes care of deploying and upgrading new locks, as well as tracking growth of protocol usage. The new version added the _ability_ for the protocol to include a protocol fee on transactions, while leaving its _activation_ to the discretion of the governance DAO.

Within the Unlock core contract, we also improved gas consumption of most functions (by using [Solidity custom errors](https://blog.soliditylang.org/2021/04/21/custom-errors/) instead of require statements).

The second important upgrade was the release of a new version of the [PublicLock contract](https://docs.unlock-protocol.com/core-protocol/public-lock/). This contract acts as a template for each lock deployed. This latest version (v13) fixes issues that appeared when canceling or burning membership keys, and makes renewals easier. It is now available as the default version for all new locks and the Unlock Dashboard naturally supports them! You also able [upgrade](https://docs.unlock-protocol.com/core-protocol/public-lock/deploying-locks/#upgrading-locks) an existing version 12 lock to version 13. (The version of your lock is displayed on the Unlock dashboard and can also be found on a block explorer.)

## Upgrading across chains

The Unlock Protocol is currently available on [9 different production chains](https://docs.unlock-protocol.com/core-protocol/unlock/networks) and several test networks. To perform a protocol upgrade means to redeploy contracts on all chains. We are very careful about consistency of the protocol across the board, so we can offer the best experience for users of various communities. To make the process smoother and more transparent, we are currently working on a way to unify our governance across the various chains we supported and handle it all to the DAO (more on that soon).

The only noticeable change this time happened on the Ethereum mainnet, where the main Unlock contract has been redeployed to reflect a change in the way [UDT token rewards](https://docs.unlock-protocol.com/governance/unlock-dao-tokens) are distributed. While we originally minted new UDT for referrers, we now distribute tokens directly from our existing supply.

## Upgrading your lock contract

If you are a lock manager, you will need to upgrade your lock contract to take advantage of the new features and improvements. To do so, follow the instructions provided in the [Unlock documentation](https://unlock-protocol.com/blog/lock-v12-release).

![v13-cover.png](/images/blog/v13/upgrading.gif)

**What if I find an issue or bug in the Unlock Protocol v13 upgrade?**

Please [open an issue on Github](https://github.com/unlock-protocol/unlock) or [tell us in Discord](https://discord.unlock-protocol.com/)!
