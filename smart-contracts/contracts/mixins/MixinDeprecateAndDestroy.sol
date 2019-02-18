pragma solidity 0.4.25;

import "../interfaces/IERC721.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";


/**
 * @title Mixin allowing the Lock owner to deprecate a Lock
 * (preventing new purchases) and then destroy it.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply 
 * separates logically groupings of code to ease readability. 
 */
contract MixinDeprecateAndDestroy is Ownable {

  event Destroy(
    uint balance,
    address indexed owner
  );

  event Disable();

  // Used to disable payable functions when deprecating an old lock
  bool public isAlive;

  // Only allow usage when contract is Alive
  modifier onlyIfAlive() {
    require(isAlive, "No access after contract has been disabled");
    _;
  }

  constructor(
  ) internal {
    isAlive = true;
  }

  /**
  * @dev Used to disable lock before migrating keys and/or destroying contract
   */
  function disableLock(
  ) external
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
  function destroyLock(
  ) external
    onlyOwner
  {
    require(isAlive == false, "Not allowed to delete an active lock");
    emit Destroy(address(this).balance, msg.sender);
    selfdestruct(msg.sender);
    // Note we don't clean up the `locks` data in Unlock.sol as it should not be necessary
    // and leaves some data behind ("Unlock.LockBalances") which may be helpful.
  }
}
