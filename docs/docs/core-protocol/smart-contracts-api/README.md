---
sidebar_position: 1
title: Unlock Smart Contract Interface Reference
pagination_next: core-protocol/unlock/README
description: >-
  Guide to Unlock Protocol smart contracts including where to find them and how
  they can be used.
---

# Interface References

This section of the docs is generated automatically from the smart contract
interface references.
<a href="https://github.com/unlock-protocol/unlock/tree/master/smart-contracts/contracts/interfaces">
<button class="button button-primary">See them on GitHub</button>
</a>

## Using Smart Contract Interfaces

A Solidity contract interface is a list of function definitions without
implementation. This allows for a separation between the interface and the
implementation much like Abstract Base Classes in Python or C++.

You can use these interfaces in your own smart contracts to interact with
Unlock Protocol smart contracts, however, they cannot be used to instantiate a
new class.

### npm module

We have packaged the interfaces along with the contracts.
<a href="https://www.npmjs.com/package/@unlock-protocol/contracts">
<button class="button button-primary">See it on npm</button>
</a>

### Load it in your project

Add them to your project using yarn

```shell
yarn add @unlock-protocol/contracts
```

or npm

```shell
npm i @unlock-protocol/contracts
```

### Examples use cases

#### Creating Hooks

Let us say for instance you would like people to be able to sell their memberships,
however you do not want people to pass these around too often to limit turnover.
So you want to let people transfer them but when they do you do not want to
charge a fee, but instead want to zero out the duration of time left. This might
make sense if you have an exclusive membership, like country club with access to
physical space, limited in the number of people.

Interfaces can be used to inject custom logic into a lock by registering
an onTransferHook that calls the `expireAndRefundFor` function.

```solidity
pragma solidity 0.8.17;
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";

contract TransferHook {
    /** Constructor */
    constructor() {}

    /** Function called after a transfer has completed */

  function onKeyTransfer(
    address lockAddress,
    uint tokenId,
    address operator,
    address from,
    address to,
    uint expirationTimestamp
  ) external{

    /** Expire the key but the refund amount is zero */
    IPublicLockV12(msg.sender).expireAndRefundFor(tokenId, 0)

  };
}

```

:::note
In order for the above hook to work you must ensure you set the contract
address as a LockManager using `addLockManager` since the `expireAndRefundFor`
function call requires the LockManager role.
:::

You can find more examples of hooks like this in the
[Smart Contracts/Hooks](/tutorials/smart-contracts/hooks/)
section of the tutorials.

#### Using them inside other smart contracts

If you want to add subscription service functionality you can use them inside of
other smart contracts to check for key ownership to the subscription Lock you have
created. You can see an example of how that can be done to add paid functions
to your dApps using Unlock in our [Smart Contracts/Unlocking Smart Contracts](/tutorials/smart-contracts/using-unlock-in-other-contracts)
section of the tutorials.
