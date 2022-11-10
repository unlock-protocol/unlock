// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';


/**
 * An example improving odds for those that purchased a key.
 */
contract DiceRoleModifier
{
  IPublicLockV8 public lock;
  event Roll(uint256 value);

  constructor(IPublicLockV8 _lockAddress)
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
