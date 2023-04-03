// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";

contract UnlockProtocolTimelock is
  TimelockControllerUpgradeable
{
  function initialize(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors
  ) public initializer {
    __TimelockController_init(
      minDelay,
      proposers,
      executors,
      msg.sender // param added when buymping to OZ 4.8.2 - not present in Unlock's deployed version
    );
  }
}
