pragma solidity 0.5.11;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import './MixinLockCore.sol';


/**
 * @title Mixin for managing `Key` data.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinKeys is
  Ownable,
  MixinLockCore
{
  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
  }

  // Called when the Lock owner expires a user's Key
  event ExpireKey(uint indexed tokenId);

  // Keys
  // Each owner can have at most exactly one key
  // TODO: could we use public here? (this could be confusing though because it getter will
  // return 0 values when missing a key)
  mapping (address => Key) private keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns 0 if the token does not exist
  // TODO: once we decouple tokenId from owner address (incl in js), then we can consider
  // merging this with totalSupply into an array instead.
  mapping (uint => address) public ownerByTokenId;

  // Ensures that an owner owns or has owned a key in the past
  modifier ownsOrHasOwnedKey(
    address _owner
  ) {
    require(
      keyByOwner[_owner].expirationTimestamp > 0, 'HAS_NEVER_OWNED_KEY'
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

  // Ensures that a key has an owner
  modifier isKey(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] != address(0), 'NO_SUCH_KEY'
    );
    _;
  }

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint _tokenId
  ) {
    require(
      isKeyOwner(_tokenId, msg.sender), 'ONLY_KEY_OWNER'
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
    Key storage key = keyByOwner[_owner];
    key.expirationTimestamp = block.timestamp; // Effectively expiring the key
    emit ExpireKey(key.tokenId);
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
    return getHasValidKey(_owner) ? 1 : 0;
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
    public view
    hasValidKey(_account)
    returns (uint)
  {
    return keyByOwner[_account].tokenId;
  }

 /**
  * A function which returns a subset of the keys for this Lock as an array
  * @param _page the page of key owners requested when faceted by page size
  * @param _pageSize the number of Key Owners requested per page
  */
  function getOwnersByPage(uint _page, uint _pageSize)
    public
    view
    returns (address[] memory)
  {
    require(totalSupply > 0, 'NO_OUTSTANDING_KEYS');
    uint pageSize = _pageSize;
    uint _startIndex = _page * pageSize;
    uint endOfPageIndex;

    if (_startIndex + pageSize > totalSupply) {
      endOfPageIndex = totalSupply;
      pageSize = totalSupply - _startIndex;
    } else {
      endOfPageIndex = (_startIndex + pageSize);
    }

    // new temp in-memory array to hold pageSize number of requested owners:
    address[] memory ownersByPage = new address[](pageSize);
    uint pageIndex = 0;

    // Build the requested set of owners into a new temporary array:
    for (uint i = _startIndex; i < endOfPageIndex; i++) {
      ownersByPage[pageIndex] = ownerByTokenId[i];
      pageIndex++;
    }

    return ownersByPage;
  }

  /**
   * Checks if the given address owns the given tokenId.
   */
  function isKeyOwner(
    uint _tokenId,
    address _owner
  ) public view
    returns (bool)
  {
    return ownerByTokenId[_tokenId] == _owner;
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner
  )
    public view
    ownsOrHasOwnedKey(_owner)
    returns (uint timestamp)
  {
    return keyByOwner[_owner].expirationTimestamp;
  }

  /**
   * @notice ERC721: Find the owner of an NFT
   * @return The address of the owner of the NFT, if applicable
  */
  function ownerOf(
    uint _tokenId
  )
    public view
    isKey(_tokenId)
    returns (address)
  {
    return ownerByTokenId[_tokenId];
  }

  /**
   * Assigns the key a new tokenId (from totalSupply) if it does not already have
   * one assigned.
   */
  function _assignNewTokenId(
    Key storage _key,
    bool isPurchase
  ) internal
  {
    if (_key.tokenId == 0) {
      if(isPurchase) {
        numberOfOwners++;
      }
      // This is a brand new owner, else an owner of an expired key buying an extension.
      // We increment the tokenId counter
      totalSupply++;
      // we assign the incremented `totalSupply` as the tokenId for the new key
      _key.tokenId = totalSupply;
    }
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
