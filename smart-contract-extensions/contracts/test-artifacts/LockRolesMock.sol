// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV9.sol';
import '../mixins/LockRoles.sol';


contract LockRolesMock is LockRoles
{
  function onlyLockManagerMock(
    IPublicLockV9 _lock
  ) external
    onlyLockManager(_lock)
  {
    // no-op
  }

  function onlyKeyGranterOrManagerMock(
    IPublicLockV9 _lock
  ) external
    onlyKeyGranterOrManager(_lock)
  {
    // no-op
  }
}