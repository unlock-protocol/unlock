// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol';

contract UnlockProtocolTimelock is TimelockControllerUpgradeable {
  /**
    * @dev Initializes the contract with the following parameters:
    *
    * - `minDelay`: initial minimum delay for operations
    * - `proposers`: accounts to be granted proposer and canceller roles
    * - `executors`: accounts to be granted executor role
    * - `admin`: optional account to be granted admin role; disable with zero address
    *
    * IMPORTANT: The optional admin can aid with initial configuration of roles after deployment
    * without being subject to delay, but this role should be subsequently renounced in favor of
    * administration through timelocked proposals. Previous versions of this contract would assign
    * this admin to the deployer automatically and should be renounced as well.
    */
  function initialize (
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors
  ) public initializer {
    __TimelockController_init(minDelay, proposers, executors, msg.sender);
  }
}