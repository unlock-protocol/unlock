// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUPSwap {
  address public tokenAddress;

  constructor(address up) {
    tokenAddress = up;
  }

  // test helper to help transfer tokens without swap
  function transfer(address recipient, uint amount) public {
    IERC20(tokenAddress).transfer(recipient, amount);
  }
}
