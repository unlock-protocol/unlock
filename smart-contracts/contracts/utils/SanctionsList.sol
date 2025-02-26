// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract SanctionsList {
  mapping(address => bool) public list;

  constructor() {}

  function addToList(address account) external {
    list[account] = true;
  }

  function isSanctioned(address account) external view returns (bool) {
    return list[account];
  }
}
