// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
  uint256 private _tokenIdCounter;

  constructor() ERC721("BasicToken", "BASIC") {}

  function mint(address holder) public returns (uint256) {
    uint256 newItemId = _tokenIdCounter;
    _mint(holder, newItemId);
    _tokenIdCounter += 1;

    return newItemId;
  }
}
