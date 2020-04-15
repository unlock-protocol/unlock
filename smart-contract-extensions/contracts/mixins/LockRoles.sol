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

  /**
   * @notice The key manager role is required to transfer or cancel a key.
   * This is typically the key owner by default.
   */
  function _isKeyManager(
    IPublicLockV7 _lock,
    uint _tokenId,
    address _user
  ) internal view
    returns (bool)
  {
    address keyManager = _lock.keyManagerOf(_tokenId);
    if(keyManager != address(0))
    {
      return keyManager == _user;
    }
    return _lock.isKeyOwner(_tokenId, _user);
  }

  /**
   * @notice The key manager role is required to transfer or cancel a key.
   * This is typically the key owner by default.
   */
  modifier onlyKeyManager(
    IPublicLockV7 _lock,
    uint _tokenId
  )
  {
    require(_isKeyManager(_lock, _tokenId, msg.sender), 'ONLY_KEY_MANAGER');
    _;
  }
}