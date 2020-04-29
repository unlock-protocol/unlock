pragma solidity 0.6.6;

import '@unlock-protocol/unlock-abi-7/IPublicLockV7Sol6.sol';
import '@openzeppelin/contracts/access/Ownable.sol';


/**
 * An example where the Lock used may be changed (or removed) by the owner.
 */
contract MutableLock is Ownable
{
  IPublicLockV7Sol6 public lock;

  function setLock(IPublicLockV7Sol6 _lockAddress) public onlyOwner
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
