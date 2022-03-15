// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinFunds.sol';
import './MixinRoles.sol';

/**
 * @title Mixin allowing the Lock owner to disable a Lock (preventing new purchases)
 * and then destroy it.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinDisable is
  MixinRoles,
  MixinFunds
{
  // Used to disable payable functions when deprecating an old lock
  bool public isAlive;

  event Disable();

  function _initializeMixinDisable(
  ) internal
  {
    isAlive = true;
  }

  // Only allow usage when contract is Alive
  function _onlyIfAlive() 
  internal
  view 
  {
    require(isAlive, 'LOCK_DEPRECATED');
  }

  /**
  * @dev Used to disable lock before migrating keys and/or destroying contract
   */
  function disableLock()
    external
  {
    _onlyLockManager();
    _onlyIfAlive();
    emit Disable();
    isAlive = false;
  }
  
  uint256[1000] private __safe_upgrade_gap;
}