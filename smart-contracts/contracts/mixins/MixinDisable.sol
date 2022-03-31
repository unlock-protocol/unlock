// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinFunds.sol';
import './MixinRoles.sol';

/**
 * The ability to disbale locks feature has been removed on v10 to decrease contract code size
 * Disabling locks can be achieved by using `setMaxNumberOfKeys` to `totalSupply`
 * and expiring all  existing keys.
 * @dev the variabales are kept to preserve stoage layout during upgrades
 */
contract MixinDisable {
  bool public isAlive;
  uint256[1000] private __safe_upgrade_gap;
}