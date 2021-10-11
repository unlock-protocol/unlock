// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

// The IPublicLockV7Sol6 interface allows us to make calls to the Lock
import '@unlock-protocol/unlock-abi-7/IPublicLockV7Sol6.sol';


/**
 * An example paid-only feature, unlocked by purchasing a key.
 */
contract PaidOnlyFeature
{
  // The address of the Lock for this content
  IPublicLockV7Sol6 public lock;

  // A very simple example functionality
  uint public callCounter;

  // If the Lock's contract address is known when this is deployed
  // we can assign it in the constructor.
  constructor(IPublicLockV7Sol6 _lockAddress) public
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
