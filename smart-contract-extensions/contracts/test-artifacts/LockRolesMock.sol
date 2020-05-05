pragma solidity 0.6.6;

import '@unlock-protocol/unlock-abi-7/IPublicLockV7Sol6.sol';
import '../mixins/LockRoles.sol';


contract LockRolesMock is LockRoles
{
  function onlyLockManagerMock(
    IPublicLockV7Sol6 _lock
  ) external
    onlyLockManager(_lock)
  {
    // no-op
  }

  function onlyKeyGranterOrManagerMock(
    IPublicLockV7Sol6 _lock
  ) external
    onlyKeyGranterOrManager(_lock)
  {
    // no-op
  }
}