pragma solidity ^0.5.0;

import 'unlock-abi-7/IPublicLockV7.sol';


/**
 * An example of a free trial, allowing any account to issue up to 1 tx per day.
 * Purchase a key for unlimited transactions!
 */
contract FreeTrial
{
  IPublicLockV7 public lock;
  mapping(address => uint256) public accountLastUse;

  constructor(IPublicLockV7 _lockAddress) public
  {
    lock = _lockAddress;
  }

  function exampleFeature() public
  {
    if(!lock.getHasValidKey(msg.sender))
    {
      require(accountLastUse[msg.sender] + 24 hours < block.timestamp, 'Limited to one call per day, unless you purchase a Key!');
    }
    accountLastUse[msg.sender] = block.timestamp;
    // Then implement your feature as normal
  }
}
