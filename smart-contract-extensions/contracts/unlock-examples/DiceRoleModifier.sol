pragma solidity ^0.5.0;

import 'unlock-abi-1-3/IPublicLockV6.sol';


/**
 * An example improving odds for those that purchased a key.
 */
contract DiceRoleModifier
{
  IPublicLock public lock;
  event Roll(uint256 value);

  constructor(IPublicLock _lockAddress) public
  {
    lock = _lockAddress;
  }

  // Warning: not-safe for production use
  function random(uint256 max) private view returns (uint256)
  {
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, block.number))) % max;
  }

  function rollDie() public
  {
    // Roll a number between 1 and 20, inclusive
    uint256 roll = random(20) + 1;
    if(lock.getHasValidKey(msg.sender))
    {
      // Key owners get a +2 modifier on every roll!
      roll += 2;
    }

    emit Roll(roll);
  }
}
