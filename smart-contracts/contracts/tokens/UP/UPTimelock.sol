// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";

contract UPTimelock is TimelockControllerUpgradeable {
  function initialize(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) public initializer {
    __TimelockController_init(minDelay, proposers, executors, admin);
  }
}
