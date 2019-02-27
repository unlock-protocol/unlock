pragma solidity 0.4.25;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';


/**
 * @title Mixin for managing `Key` data.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply 
 * separates logically groupings of code to ease readability. 
 */
contract MixinKeys is
  Ownable
{
  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
    bytes data; // Note: This can be expensive?
  }

  // Keys
  // Each owner can have at most exactly one key
  // TODO: could we use public here? (this could be confusing though because it getter will
  // return 0 values when missing a key)
  mapping (address => Key) private keyByOwner;

  // Ensures that an owner has a key
  modifier hasKey(
    address _owner
  ) {
    Key storage key = keyByOwner[_owner];
    require(
      key.expirationTimestamp > 0, 'NO_SUCH_KEY'
    );
    _;
  }

  // Ensures that an owner has a valid key
  modifier hasValidKey(
    address _owner
  ) {
    require(
      getHasValidKey(_owner), 'KEY_NOT_VALID'
    );
    _;
  }

  /**
   * A function which lets the owner of the lock expire a users' key.
   */
  function expireKeyFor(
    address _owner
  )
    public
    onlyOwner
    hasValidKey(_owner)
  {
    keyByOwner[_owner].expirationTimestamp = block.timestamp; // Effectively expiring the key
  }

  /**
  * @dev Returns the key's data field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyDataFor(
    address _owner
  )
    public
    view
    hasKey(_owner)
    returns (bytes memory data)
  {
    return keyByOwner[_owner].data;
  }

  /**
   * In the specific case of a Lock, each owner can own only at most 1 key.
   * @return The number of NFTs owned by `_owner`, either 0 or 1.
  */
  function balanceOf(
    address _owner
  )
    external
    view
    returns (uint)
  {
    require(_owner != address(0), 'INVALID_ADDRESS');
    return keyByOwner[_owner].expirationTimestamp > 0 ? 1 : 0;
  }

  /**
   * Checks if the user has a non-expired key.
   */
  function getHasValidKey(
    address _owner
  )
    public
    view
    returns (bool)
  {
    return keyByOwner[_owner].expirationTimestamp > block.timestamp;
  }

  /**
   * @notice Find the tokenId for a given user
   * @return The tokenId of the NFT, else revert
  */
  function getTokenIdFor(
    address _account
  )
    external
    view
    hasKey(_account)
    returns (uint)
  {
    return keyByOwner[_account].tokenId;
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner
  )
    public
    view
    hasKey(_owner)
    returns (uint timestamp)
  {
    return keyByOwner[_owner].expirationTimestamp;
  }

  /**
   * Returns the Key struct for the given owner.
   */
  function _getKeyFor(
    address _owner
  ) internal view
    returns (Key storage)
  {
    return keyByOwner[_owner];
  }
}