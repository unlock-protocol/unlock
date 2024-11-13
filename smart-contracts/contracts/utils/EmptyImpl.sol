// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

contract EmptyImpl {
  constructor() {}

  function name() external returns (string memory) {
    return "";
  }
}
