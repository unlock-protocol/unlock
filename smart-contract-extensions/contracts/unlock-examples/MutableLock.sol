// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';
import '@openzeppelin/contracts/access/Ownable.sol';


/**
 * An example where the Lock used may be changed (or removed) by the owner.
 */
contract MutableLock is Ownable
{
  IPublicLockV8 public lock;

  uint public callCounter;

  function setLock(IPublicLockV8 _lockAddress) public onlyOwner
  {
    lock = _lockAddress;
  }

  function paidOnlyFeature() public
  {
    // If there is no lock assigned, we can't require they bought a key!
    require(address(lock) == address(0) || lock.getHasValidKey(msg.sender), 'Purchase a key first!');

    // Then implement your feature as normal
    callCounter++;
  }
}
