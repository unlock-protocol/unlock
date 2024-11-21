---
title: Deploying Locks
description: Find out how Public Lock can be instantiated and deployed.
sidebar_position: 1
---

In order to ensure full compatibility between all the membership contracts, locks are deployed from the [Unlock factory contract](../unlock/). This contract can be called from your own contracts or RPC endpoints and libraries [like Ethers.js](/docs/tutorials/smart-contracts/ethers.md).

### `createUpgradableLockAtVersion`

[This method](/core-protocol/smart-contracts-api/Unlock#createupgradeablelockatversion) is the **recommended method to deploy locks**. It takes a blob of packed arguments as well as a version of the `PublicLock` (membership contract), and it eliminates the worry of breaking changes when new versions are released, as it deploys locks at the same version, even when new versions have been released.

Here is an example using the `ethers` library:

```js
const Unlock = require('@unlock-protocol/contracts').UnlockV12.abi
const PublicLock = require('@unlock-protocol/contracts').PublicLockV13.abi

// Version must match the PublicLock import above!
const version = 13

// Create an instance of the Unlock factory contract.
const unlock = new ethers.Contract(unlockAddress, Unlock, wallet)

// To create a lock, depending on the version, we need to create calldata
// For this, we use the PublicLock's ABI to encode the right function call
const lockInterface = new ethers.Interface(PublicLock)
const calldata = lockInterface.encodeFunctionData(
  'initialize(address,uint256,address,uint256,uint256,string)',
  [
    '0x81Dd955D02D337DB81BA6c9C5F6213E647672052' /* address of the first lock manager */,
    60 * 60 * 24 * 30, // expirationDuration (in seconds)
    '0x0000000000000000000000000000000000000000', // address of an ERC20 contract to use as currency (or 0x0000000000000000000000000000000000000000 for native)
    12000000000000000n, // (0.012 eth) Amount to be paid (make sure to include decimals if necessary, e.g. 1e18 for 1 ETH),
    1337, // Maximum number of NFTs that can be purchased
    'My demo membership contract', // Name of membership contract
  ]
)
await unlock.createUpgradeableLockAtVersion(calldata, version)
```

This is the method the Unlock labs team uses in the Unlock [Dashboard](../../tools/dashboard/) so that we have time after a new version is released to update the UI to support it. Locks deployed using this method can later be upgraded to newer versions. Your application should verify the version of a lock to avoid unexpected behaviors.

You can also create Locks from another contract that would be called the Unlock factory contract. This can be useful if your application requires a specific lock setup (special referrer fees, metadata... etc), but also if you want to deploy locks on behalf of users and provide a gasless experience for lock managers.

### `createLock`

This method provides the simplest interface as it takes arguments for the duration of each NFT membership (key), the currency contract address, the price, the maximum number of keys, the name... etc. It creates locks that are using the current version of the protocol.

:::note
If a new version of the protocol is released using "createLock" might break your implementation of a deployment script as the signature for that function might change, and the locks deployed after the upgrade might be of a newer version.
:::

## Upgrading Locks

All locks (after version 9) are upgradable!

Contract upgrades can only be made using new versions that are supported by the protocol (ie. [approved by the Unlock DAO](../../governance/unlock-dao/)) and can only be triggered by a lock manager on _their_ lock(s). The core team, the DAO, or anyone else are **not** able to upgrade locks.

See ["Contract Management"](../../core-protocol/public-lock/access-control/) for more details on the roles and permissions.

:::caution
If a Lock manager renounces their role, leaving no lock manager, then a Lock can no longer be upgraded.
:::
