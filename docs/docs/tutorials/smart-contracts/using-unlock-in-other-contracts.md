---
title: Unlocking Smart Contracts
description: >-
  Token-gating a smart contract is possible with Unlock Protocol and this
  tutorial goes over how that is done.
---

# Unlocking Smart Contracts

Smart contract developers can easily integrate with Unlock Protocol on-chain, allowing them to limit access to certain features or change the behavior of functions based on membership status!

In this tutorial, we will focus on integrating a Lock itself, rather than the Unlock contract.
## Paid only features

The lock contract has multiple functions you could use to assess the membership status of a given address. The most obvious one is called `balanceOf`. It will either return `1` if the address owns a valid membership and `0` otherwise (whether the membership has expired, or the address never had one).

Here is an example on how to easily create a contract that has a "members only" feature:

```solidity
pragma solidity ^0.5.0;

import 'contracts/interfaces/IPublicLock.sol';

contract PaidOnlyFeature
{
  IPublicLock public lock;

  constructor(IPublicLock _lockAddress) public
  {
    lock = _lockAddress;
  }

  function paidOnlyFeature() public
  {
    require(lock.balanceOf(msg.sender) > 0, 'Purchase a membership first!');
    // ...and then implement your feature as normal. If needed you could even make that a modifier
  }

  // You can also have free features of course
}
```
