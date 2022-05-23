// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV9.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

contract ERC1155BalanceOfHook {
  
  // store contract mapping lock => nft (erc1155)
  mapping(address => address) public nftAddresses;

  // nft (erc1155) => token type (id)
  mapping(address => uint256) public nftTokenIds;

  function createMapping(
    address _lockAddress, 
    address _nftAddress,
    uint _tokenTypeId
  ) 
  external 
  {
    require(_lockAddress != address(0), 'Lock address can not be zero');
    require(_nftAddress != address(0), 'ERC1155 address can not be zero');
    
    // make sure lock manager
    IPublicLockV9 lock = IPublicLockV9(_lockAddress);
    require(lock.isLockManager(msg.sender), 'Caller does not have the LockManager role');
    
    // store mapping
    nftAddresses[_lockAddress] = _nftAddress;

    // store tokens
    nftTokenIds[_lockAddress] = _tokenTypeId;
  }

  function hasValidKey(
    address _lockAddress,
    address _keyOwner,
    uint256, // _expirationTimestamp,
    bool isValidKey
  ) 
  external view
  returns (bool)
  {
    if (isValidKey) return true;

    // get nft contract 
    address nftAddress = nftAddresses[_lockAddress];
    if(nftAddress == address(0)) return false;
    
    // get token type
    uint tokenTypeId = nftTokenIds[_lockAddress];

    // get nft balance
    IERC1155 nft = IERC1155(nftAddress);
    return nft.balanceOf(_keyOwner, tokenTypeId) > 0;
  }

}