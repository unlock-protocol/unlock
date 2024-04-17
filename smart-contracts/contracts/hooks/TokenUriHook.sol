// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract TokenUriHook {
  using Strings for address;
  using Strings for uint;

  mapping(address => string) public baseURIs;

  event BaseURISet(address indexed lock, string baseURIs, address manager);

  constructor() {}

  function setBaseURI(address lock, string memory _baseURI) public {
    if (IPublicLockV12(lock).isLockManager(msg.sender) == false) {
      revert("Only lock manager can set base URI");
    }
    baseURIs[lock] = _baseURI;
    emit BaseURISet(lock, _baseURI, msg.sender);
  }

  function tokenURI(
    address lock,
    address,
    address owner,
    uint tokenId,
    uint expiration
  ) public view returns (string memory) {
    if (owner == address(0)) {
      return "";
    }
    return
      string(
        abi.encodePacked(
          baseURIs[lock],
          "/",
          owner.toHexString(),
          "?tokenId=",
          tokenId.toString(),
          "&expiration=",
          expiration.toString()
        )
      );
  }
}
