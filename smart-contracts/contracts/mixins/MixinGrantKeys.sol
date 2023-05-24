// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MixinKeys.sol";
import "./MixinRoles.sol";
import "./MixinErrors.sol";

/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is MixinErrors, MixinRoles, MixinKeys {
  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps,
    address[] calldata _keyManagers
  ) external returns (uint[] memory) {
    _lockIsUpToDate();
    if (!hasRole(KEY_GRANTER_ROLE, msg.sender) && !isLockManager(msg.sender)) {
      revert ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
    }

    uint[] memory tokenIds = new uint[](_recipients.length);
    for (uint i = 0; i < _recipients.length; i++) {
      // an event is triggered
      tokenIds[i] = _createNewKey(
        _recipients[i],
        _keyManagers[i],
        _expirationTimestamps[i]
      );

      if (address(onKeyGrantHook) != address(0)) {
        onKeyGrantHook.onKeyGranted(
          tokenIds[i],
          msg.sender,
          _recipients[i],
          _keyManagers[i],
          _expirationTimestamps[i]
        );
      }
    }
    return tokenIds;
  }

  /**
   * Allows the Lock owner or key granter to extend an existing keys with no charge. This is the "renewal" equivalent of `grantKeys`.
   * @param _tokenId The id of the token to extend
   * @param _duration The duration in secondes to add ot the key
   * @dev set `_duration` to 0 to use the default duration of the lock
   */
  function grantKeyExtension(uint _tokenId, uint _duration) external {
    _lockIsUpToDate();
    _isKey(_tokenId);
    if (!hasRole(KEY_GRANTER_ROLE, msg.sender) && !isLockManager(msg.sender)) {
      revert ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
    }
    _extendKey(_tokenId, _duration);
  }

  uint256[1000] private __safe_upgrade_gap;
}
