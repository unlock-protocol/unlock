pragma solidity 0.5.4;

import '../interfaces/IERC721.sol';

/**
 * @title Mixin for Key ownership related functions needed to meet the ERC721 
 * standard
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply 
 * separates logically groupings of code to ease readability. 
 */
contract MixinKeyOwner is IERC721 {
   
  // Each tokenId can have at most exactly one owner at a time.
  // Returns 0 if the token does not exist
  // TODO: once we decouple tokenId from owner address (incl in js), then we can consider
  // merging this with numberOfKeysSold into an array instead.
  mapping (uint => address) private ownerByTokenId;

  // Addresses of owners are also stored in an array.
  // Addresses are never removed by design to avoid abuses around referals
  address[] public owners;

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint _tokenId
  ) {
    require(
      isKeyOwner(_tokenId, msg.sender), 'ONLY_KEY_OWNER'
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
    require(owners.length > 0, 'NO_OUTSTANDING_KEYS');
    uint pageSize = _pageSize;
    uint _startIndex = _page * pageSize;
    uint endOfPageIndex;

    if (_startIndex + pageSize > owners.length) {
      endOfPageIndex = owners.length;
      pageSize = owners.length - _startIndex;
    } else {
      endOfPageIndex = (_startIndex + pageSize);
    }

    // new temp in-memory array to hold pageSize number of requested owners:
    address[] memory ownersByPage = new address[](pageSize);
    uint pageIndex = 0;

    // Build the requested set of owners into a new temporary array:
    for (uint i = _startIndex; i < endOfPageIndex; i++) {
      ownersByPage[pageIndex] = owners[i];
      pageIndex++;
    }

    return ownersByPage;
  }

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than outstandingKeys.
   */
  function numberOfOwners()
    public
    view
    returns (uint)
  {
    return owners.length;
  }

  /**
   * @notice ERC721: Find the owner of an NFT
   * @return The address of the owner of the NFT, if applicable
  */
  function ownerOf(
    uint _tokenId
  )
    public
    view
    isKey(_tokenId)
    returns (address)
  {
    return ownerByTokenId[_tokenId];
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
   * Adds a new (unique) Key owner.
   */
  function _addNewOwner(
    address _owner
  ) internal
  {
    owners.push(_owner);
  }

  /**
   * Sets the Key owner for a given tokenId.
   */
  function _setKeyOwner(
    uint _tokenId,
    address _owner
  ) internal
  {
    ownerByTokenId[_tokenId] = _owner;
  } 
}
