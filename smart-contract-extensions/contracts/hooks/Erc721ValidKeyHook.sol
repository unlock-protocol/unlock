// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV9.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

contract Erc721TokenUriHook {
  
  mapping(address => address) nftAddresses;

  function createMapping(
    address _lockAddress, 
    address _nftAddress
  ) 
  external 
  {
    // make sure lock manager
    IPublicLockV9 lock = IPublicLockV9(_lockAddress);
    require(lock.isLockManager(msg.sender), 'Caller does not have the LockManager role');
    
    // store mapping
    nftAddresses[_lockAddress] = _nftAddress;
  }

  function hasValidKey(
    address _lockAddress,
    address _keyOwner,
    uint256, // _expirationTimestamp,
    bool // isValidKey
  ) 
  external view
  returns (bool)
  {

    address nftAddress = nftAddresses[_lockAddress];
    IERC721 nft = IERC721(nftAddress);

    return nft.balanceOf(_keyOwner) > 0;
  }

}