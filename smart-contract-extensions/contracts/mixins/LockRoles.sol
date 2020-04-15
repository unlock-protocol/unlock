pragma solidity ^0.5.0;

import 'unlock-abi-7/IPublicLockV7.sol';


/**
 * @notice Provides modifiers for interfacing with roles from a lock.
 */
contract LockRoles
{
  /**
   * @notice Lock managers are admins for the lock contract.
   */
  modifier onlyLockManager(
    IPublicLockV7 _lock
  )
  {
    require(_lock.isLockManager(msg.sender), 'ONLY_LOCK_MANAGER');
    _;
  }

  /**
   * @notice Key granters and lock managers have permission to distribute keys without any expense.
   */
  modifier onlyKeyGranterOrManager(
    IPublicLockV7 _lock
  )
  {
    require(_lock.isKeyGranter(msg.sender) || _lock.isLockManager(msg.sender), 'ONLY_KEY_GRANTER');
    _;
  }
}