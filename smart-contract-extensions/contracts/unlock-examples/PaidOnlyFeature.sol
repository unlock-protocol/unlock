// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

// The IPublicLockV8 interface allows us to make calls to the Lock
import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';


/**
 * An example paid-only feature, unlocked by purchasing a key.
 */
contract PaidOnlyFeature
{
  // The address of the Lock for this content
  IPublicLockV8 public lock;

  // A very simple example functionality
  uint public callCounter;

  // If the Lock's contract address is known when this is deployed
  // we can assign it in the constructor.
  constructor(IPublicLockV8 _lockAddress)
  {
    lock = _lockAddress;
  }

  // In order to call this function, you must own a key
  function paidOnlyFeature() public
  {
    // Revert the transaction if the user doesn't have a valid key
    require(lock.getHasValidKey(msg.sender), 'Purchase a key first!');

    // ...and then implement your feature as normal
    callCounter++;
  }

  // You can also have free features of course
}
