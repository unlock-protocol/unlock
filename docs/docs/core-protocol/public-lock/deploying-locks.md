---
title: Deploying Locks
description: Find out how Public Lock can be instantiated and deployed.
sidebar_position: 1
---

In order to ensure full compatibility between all the membership contracts, locks are deployed from the [Unlock factory contract](../unlock/). This contract can be called from your own contracts or RPC endpoints and libraries [like Ethers.js](/docs/tutorials/smart-contracts/ethers.md).

### `createUpgradableLockAtVersion`

This method is the recommended method to deploy locks. It takes a blob of packed arguments as well as a version, but it does eliminate the worry of breaking changes when new versions are released, as it deploys locks at the same version, even when new versions have been released. This is the method the Unlock labs team uses in the Unlock [Dashboard](../../tools/dashboard/) so that we have time after a new version is released to update the UI to support it.

Locks deployed using this method can later be upgraded to newer versions. Your application should verify the version of a lock to avoid unexpected behaviors.

### `createLock`

This method provides the simplest interface as it takes arguments for the duration of each NFT membership (key), the currency contract address, the price, the maximum number of keys, the name... etc. It creates locks that are using the current version of the protocol.

:::note
If a new version of the protocol is released using "createLock" might break your implementation of a deployment script as the signature for that function migth change, and the locks deployed after the upgrade might be of a newer version.
:::

## Upgrading Locks

Don't let the names fool you! All locks (after version 9) are upgradable!

Contract upgrades can only be made using new versions that are supported by the protocol (ie. approved by the DAO) and can only be triggered by a lock manager on _their_ lock(s). The core team, the DAO, or anyone else are **not** able to upgrade locks.

See ["Contract Management"](../../core-protocol/public-lock/access-control/) for more details on the roles and permissions.

:::caution
If a Lock manager renounces their role, leaving no lock manager, then a Lock can no longer be upgraded.
:::
