// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinKeys.sol';
import './MixinRoles.sol';


/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is
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
    require(isKeyGranter(msg.sender) || isLockManager(msg.sender), 'ONLY_LOCK_MANAGER_OR_KEY_GRANTER');

    for(uint i = 0; i < _recipients.length; i++) {
      address recipient = _recipients[i];
      uint expirationTimestamp = _expirationTimestamps[i];
      address keyManager = _keyManagers[i];

      require(recipient != address(0), 'INVALID_ADDRESS');

      Key memory toKey = getKeyOfOwnerByIndex(recipient, 0);
      require(expirationTimestamp > toKey.expirationTimestamp, 'ALREADY_OWNS_KEY');

      if(toKey.tokenId == 0) {
        _createNewKey(
          recipient,
          keyManager,
          expirationTimestamp
        );
      } else {
        // Set the key Manager
        _setKeyManagerOf(toKey.tokenId, keyManager);
        emit KeyManagerChanged(toKey.tokenId, keyManager);

        // update ts
        _updateKeyExpirationTimestamp(
          recipient,
          expirationTimestamp
        );
      
        // trigger event
        emit Transfer(
          address(0), // This is a creation.
          recipient,
          toKey.tokenId
        );
      }
      
    }
  }

  uint256[1000] private __safe_upgrade_gap;
}
