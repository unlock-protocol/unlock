// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MockUPSwap {
  address public tokenAddress;

  constructor() {}

  function setUp() public {
    tokenAddress = msg.sender;
  }
}
