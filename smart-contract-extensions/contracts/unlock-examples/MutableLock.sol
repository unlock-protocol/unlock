pragma solidity ^0.5.0;

import 'unlock-abi-1-3/IPublicLockV6.sol';
import '@openzeppelin/contracts/ownership/Ownable.sol';


/**
 * An example where the Lock used may be changed (or removed) by the owner.
 */
contract MutableLock is Ownable
{
  IPublicLock public lock;

  function setLock(IPublicLock _lockAddress) public onlyOwner
  {
    lock = _lockAddress;
  }

  function paidOnlyFeature() public
  {
    // If there is no lock assigned, we can't require they bought a key!
    require(address(lock) == address(0) || lock.getHasValidKey(msg.sender), 'Purchase a key first!');
    // Then implement your feature as normal
  }
}
