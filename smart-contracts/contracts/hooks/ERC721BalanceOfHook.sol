// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV9.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC721BalanceOfHook {
  mapping(address => address) public nftAddresses;

  function createMapping(address _lockAddress, address _nftAddress) external {
    require(_lockAddress != address(0), "Lock address can not be zero");
    require(_nftAddress != address(0), "ERC721 address can not be zero");

    // make sure lock manager
    IPublicLockV9 lock = IPublicLockV9(_lockAddress);
    require(
      lock.isLockManager(msg.sender),
      "Caller does not have the LockManager role"
    );

    // store mapping
    nftAddresses[_lockAddress] = _nftAddress;
  }

  function isValidKey(
    address _lockAddress,
    address, // operator
    uint, //tokenId
    uint, // _expirationTimestamp,
    address _keyOwner,
    bool _isValidKey
  ) public view returns (bool) {
    if (_isValidKey) return true;

    // get nft contract
    address nftAddress = nftAddresses[_lockAddress];
    if (nftAddress == address(0)) return false;

    // get nft balance
    IERC721 nft = IERC721(nftAddress);
    return nft.balanceOf(_keyOwner) > 0;
  }
}
