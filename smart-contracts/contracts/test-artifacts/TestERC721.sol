// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
  uint private _lastTokenId = 1;

  constructor() ERC721("BasicToken", "BASIC") {}

  function mint(address holder) public returns (uint256) {
    _lastTokenId++;

    uint256 newItemId = _lastTokenId;
    _mint(holder, newItemId);

    return newItemId;
  }
}
