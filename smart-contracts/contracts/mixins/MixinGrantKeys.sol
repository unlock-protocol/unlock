pragma solidity 0.5.8;

import '../interfaces/IERC721.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import './MixinKeys.sol';


/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is
  IERC721,
  Ownable,
  MixinKeys
{
  /**
   * Allows the Lock owner to give a user a key with no charge.
   */
  function grantKey(
    address _recipient,
    uint _expirationTimestamp
  ) external
    onlyOwner
  {
    _grantKey(_recipient, _expirationTimestamp);
  }

  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * All keys granted have the same expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint _expirationTimestamp
  ) external
    onlyOwner
  {
    for(uint i = 0; i < _recipients.length; i++) {
      _grantKey(_recipients[i], _expirationTimestamp);
    }
  }

  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps
  ) external
    onlyOwner
  {
    for(uint i = 0; i < _recipients.length; i++) {
      _grantKey(_recipients[i], _expirationTimestamps[i]);
    }
  }

  /**
   * Give a key to the given user
   */
  function _grantKey(
    address _recipient,
    uint _expirationTimestamp
  ) private
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');

    Key storage toKey = _getKeyFor(_recipient);
    require(_expirationTimestamp > toKey.expirationTimestamp, 'ALREADY_OWNS_KEY');

    _assignNewTokenId(toKey);
    _recordOwner(_recipient, toKey.tokenId);
    toKey.expirationTimestamp = _expirationTimestamp;

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      toKey.tokenId
    );
  }
}
