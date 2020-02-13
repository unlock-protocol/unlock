pragma solidity 0.5.16;

import './MixinKeys.sol';
import './MixinKeyGranterRole.sol';


/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is
  MixinKeys,
  MixinKeyGranterRole
{
  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps
  ) external
    onlyKeyGranter
  {
    for(uint i = 0; i < _recipients.length; i++) {
      address recipient = _recipients[i];
      uint expirationTimestamp = _expirationTimestamps[i];

      require(recipient != address(0), 'INVALID_ADDRESS');

      Key storage toKey = keyByOwner[recipient];
      require(expirationTimestamp > toKey.expirationTimestamp, 'ALREADY_OWNS_KEY');

      _assignNewTokenId(toKey);
      _recordOwner(recipient, toKey.tokenId);
      toKey.expirationTimestamp = expirationTimestamp;

      // trigger event
      emit Transfer(
        address(0), // This is a creation.
        recipient,
        toKey.tokenId
      );
    }
  }
}
