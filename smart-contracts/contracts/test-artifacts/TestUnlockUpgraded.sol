// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IPublicLock.sol";
import "../Unlock.sol";

contract TestUnlockUpgraded is Unlock {

  // add a function to try
  function sayHello()
    external
    pure
    returns (string memory)
  {
    return "hello world";
  }


}

interface ITestPublicLockUpgraded is IPublicLock {
  function sayHello() external pure returns (string memory);
}
