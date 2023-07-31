---
title: Deploying from another contract
description: Locks are deployed from the Unlock factory, and the Unlock factory itself can be called from another contract.
---

In some cases, applications want to deploy locks that are customized to support specific features.

- One approach would be to deploy the lock first and then prompt the lock manager to send transactions to perform the changes that are required.
- Another approach is to "wrap" the deployment in a custom contract that would perform all the configuration at deployment time. This has several benefits, the main one being the need to only send a single transaction.

Here is an example where we deploy locks of version `12` for which keys are non-transferable by default (we apply a penalty of 100% for transfers) and we set a custom manager.

```solidity
import "@unlock-protocol/contracts/dist/Unlock/IUnlock.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";

pragma solidity ^0.8.0;

contract MyUnlockFactory {
  address unlockAddress;

  constructor(address _unlockAddress) {
    unlockAddress = _unlockAddress;
  }

  function deployLockWithNonTransferableKeys(address user, bytes calldata data) external returns (address) {
    IUnlock unlock = IUnlock(unlockAddress);

    address newLockAddress = unlock.createUpgradeableLockAtVersion(data, 12);
    IPublicLockV12(newLockAddress).updateRefundPenalty(0, 10000);
    IPublicLockV12(newLockAddress).addLockManager(user);
    IPublicLockV12(newLockAddress).renounceLockManager();

    return newLockAddress;
  }
}
```

This technique can be used to [set hooks](../../core-protocol/public-lock/hooks.md), apply referrer fees, or change any property on the lock. Importantly, as the deployer, the `MyUnlockFactory` is the first lock manager. In this example, we immediately renounce that role but if this contract kept the role, it could also have additional functions that could be called later to change the behavior of the contract.
