pragma solidity 0.5.17;

import './MixinFunds.sol';
import './MixinLockManagerRole.sol';

/**
 * @title Mixin allowing the Lock owner to disable a Lock (preventing new purchases)
 * and then destroy it.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinDisable is
  MixinLockManagerRole,
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
  modifier onlyIfAlive() {
    require(isAlive, 'LOCK_DEPRECATED');
    _;
  }

  /**
  * @dev Used to disable lock before migrating keys and/or destroying contract
   */
  function disableLock()
    external
    onlyLockManager
    onlyIfAlive
  {
    emit Disable();
    isAlive = false;
  }
}