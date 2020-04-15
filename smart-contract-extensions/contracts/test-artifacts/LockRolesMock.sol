pragma solidity ^0.5.0;

import 'unlock-abi-7/IPublicLockV7.sol';
import '../mixins/LockRoles.sol';


contract LockRolesMock is LockRoles
{
  function onlyLockManagerMock(
    IPublicLockV7 _lock
  ) external
    onlyLockManager(_lock)
  {
    // no-op
  }

  function onlyKeyGranterOrManagerMock(
    IPublicLockV7 _lock
  ) external
    onlyKeyGranterOrManager(_lock)
  {
    // no-op
  }
}