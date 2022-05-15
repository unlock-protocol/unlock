// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * The ability to disable locks has been removed on v10 to decrease contract code size.
 * Disabling locks can be achieved by setting `setMaxNumberOfKeys` to `totalSupply`
 * and expire all existing keys.
 * @dev the variables are kept to prevent conflicts in storage layout during upgrades
 */
contract MixinDisable {
  bool isAlive;
  uint256[1000] private __safe_upgrade_gap;
}