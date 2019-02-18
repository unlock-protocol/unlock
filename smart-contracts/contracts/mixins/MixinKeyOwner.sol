pragma solidity 0.4.25;

import "../interfaces/IERC721.sol";


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
  mapping (uint => address) internal ownerByTokenId;
  
  // Addresses of owners are also stored in an array.
  // Addresses are never removed by design to avoid abuses around referals
  address[] public owners;

  // Ensure that the caller owns the key
  modifier onlyKeyOwner(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] == msg.sender, "Not the key owner"
    );
    _;
  }

  // Ensures that a key has an owner
  modifier isKey(
    uint _tokenId
  ) {
    require(
      ownerByTokenId[_tokenId] != address(0), "No such key"
    );
    _;
  }

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than outstandingKeys.
   */
  function numberOfOwners(
  ) external view
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
  ) public view
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
}
