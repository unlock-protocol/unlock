// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {
  constructor() ERC1155("tokenURIExample") {}

  function mint(address holder, uint tokenTypeId) public {
    _mint(holder, tokenTypeId, 1, "");
  }
}
