// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../UnlockDiscountTokenV3.sol";

contract TestUnlockDiscountTokenV4 is UnlockDiscountTokenV3 {

  // add a function to try
  function sayHello() external pure returns (string memory) {
    return 'hello world';
  }
}
