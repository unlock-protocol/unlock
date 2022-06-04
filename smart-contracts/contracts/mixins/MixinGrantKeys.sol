// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinKeys.sol';
import './MixinRoles.sol';
import './MixinErrors.sol';


/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is
  MixinErrors,
  MixinRoles,
  MixinKeys
{
  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps,
    address[] calldata _keyManagers
  ) external {
    _lockIsUpToDate();
    if(!isKeyGranter(msg.sender) && !isLockManager(msg.sender)) {
      revert ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
    }

    for(uint i = 0; i < _recipients.length; i++) {
      // an event is triggered
      _createNewKey(
        _recipients[i],
        _keyManagers[i],  
        _expirationTimestamps[i]
      ); 
    }
  }

  uint256[1000] private __safe_upgrade_gap;
}
