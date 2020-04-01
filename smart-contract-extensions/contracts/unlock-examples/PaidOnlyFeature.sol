pragma solidity ^0.5.0;

// The IPublicLockV7 interface allows us to make calls to the Lock
import 'unlock-abi-7/IPublicLockV7.sol';


/**
 * An example paid-only feature, unlocked by purchasing a key.
 */
contract PaidOnlyFeature
{
  // The address of the Lock for this content
  IPublicLockV7 public lock;

  // If the Lock's contract address is known when this is deployed
  // we can assign it in the constructor.
  constructor(IPublicLockV7 _lockAddress) public
  {
    lock = _lockAddress;
  }

  // In order to call this function, you must own a key
  function paidOnlyFeature() public
  {
    // Revert the transaction if the user doesn't have a valid key
    require(lock.getHasValidKey(msg.sender), 'Purchase a key first!');

    // ...and then implement your feature as normal
  }

  // You can also have free features of course
}
