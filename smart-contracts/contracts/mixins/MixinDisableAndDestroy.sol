pragma solidity 0.5.9;

import '../interfaces/IERC721.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import './MixinFunds.sol';

/**
 * @title Mixin allowing the Lock owner to disable a Lock (preventing new purchases)
 * and then destroy it.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinDisableAndDestroy is
  IERC721,
  Ownable,
  MixinFunds
{
  // Used to disable payable functions when deprecating an old lock
  bool public isAlive;

  event Destroy(
    uint balance,
    address indexed owner
  );

  event Disable();

  constructor(
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
    onlyOwner
    onlyIfAlive
  {
    emit Disable();
    isAlive = false;
  }

  /**
  * @dev Used to clean up old lock contracts from the blockchain
  * TODO: add a check to ensure all keys are INVALID!
   */
  function destroyLock()
    external
    onlyOwner
  {
    require(isAlive == false, 'DISABLE_FIRST');

    emit Destroy(address(this).balance, msg.sender);

    // this will send any ETH or ERC20 held by the lock to the owner
    _transfer(msg.sender, getBalance(address(this)));
    selfdestruct(msg.sender);

    // Note we don't clean up the `locks` data in Unlock.sol as it should not be necessary
    // and leaves some data behind ('Unlock.LockBalances') which may be helpful.
  }

}