---
title: Unlocking Smart Contracts
subTitle: Integrating Unlock-Protocol into your Smart Contracts
authorName: Nick Mancuso
publishDate: October 31, 2019
description: Unlock value-added features directly in your smart contract. Trivial to implement with endless opportunities. We show you how and discuss some reasons why this might be interesting to you.
image: /images/blog/unlocking-smart-contracts/code.jpeg
---

Smart contract developers can integrate with Unlock Protocol on-chain, allowing you to monetize features by selling Keys.

Let’s clear up a little terminology first. ‘Unlock Protocol’ allows you to create ‘Locks’ for specific content or features. Users can then purchase a ‘Key’ to gain access to that content. Keys may expire, allowing you to offer a monthly subscription option, and they are NFTs enabling a second hand market if you choose. We’re adding new features all the time.

<p style="text-align:center">
	<img src="/images/blog/unlocking-smart-contracts/code.jpeg" width="400px" alt="Smart contracts">
</p>

From your smart contract, you simply call `getHasValidKey` on the Lock to see if the user should gain access.

A simple example is unlocking a paid-only feature in your contract. Let me show you how…

```
pragma solidity ^0.5.0;

import 'hardlydifficult-ethereum-contracts/contracts/interfaces/IPublicLock.sol';

contract PaidOnlyFeature
{
  IPublicLock public lock;

  constructor(IPublicLock _lockAddress) public
  {
    lock = _lockAddress;
  }

  function paidOnlyFeature() public
  {
    require(lock.getHasValidKey(msg.sender), 'Purchase a key first!');
    // ...and then implement your feature as normal
  }

  // You can also have free features of course
}
```

Pretty straight forward, right? Let’s step through it.

First we need to install an NPM package with this command:

```
npm i hardlydifficult-ethereum-contracts
```

Now we can review the code...

```
import 'hardlydifficult-ethereum-contracts/contracts/interfaces/IPublicLock.sol';
```

Importing the interface allows us to make calls to the Lock contract, given its address.

```
IPublicLock public lock;
```

To gain access, users must purchase a key to the Lock for this content. This stores the address for the Lock contract. By using `IPublicLock` instead of `address` we simplify making calls within the contract. `public` allows end-users to read the Lock’s address, confirming they are purchasing the correct Key.

```
constructor(IPublicLock _lockAddress) public
{
  lock = _lockAddress;
}
```

We have to set the address for the Lock to use at some point. If you know it when this contract is deployed you can simply assign it in the constructor. However you might also consider a privileged call instead, allowing you to update the Lock in the future if needed. Here’s an example of a [MutableLock](https://github.com/unlock-protocol/unlock/blob/master/smart-contract-extensions/contracts/unlock-examples/MutableLock.sol).

```
require(lock.getHasValidKey(msg.sender), 'Purchase a key first!');
```

`getHasValidKey` checks if the given address owns a valid (unexpired) key and returns true or false. We place this in a `require` statement so that the entire transaction fails if they do not. If you prefer, this could be moved to a `modifier` instead. Alternatively you could use an `if` condition instead to modify behavior for Key owners somehow (we have a few ideas about that below).

That’s the contract implementation! The hardest part can be testing though. We need a way to run your contract locally, and to make calls with and without owning a Key. For this we have a script to get you started:

```javascript
const { protocols } = require('hardlydifficult-ethereum-contracts')
const PaidOnlyFeature = artifacts.require('PaidOnlyFeature')

contract('PaidOnlyFeature', accounts => {
  let lock
  let featureContract
  const keyOwner = accounts[3]

  beforeEach(async () => {
    lock = await protocols.unlock.createTestLock(
      web3,
      accounts[9], // Unlock Protocol owner
      accounts[1], // Lock owner
      {
        keyPrice: web3.utils.toWei('0.01', 'ether'),
      }
    )

    featureContract = await PaidOnlyFeature.new(lock.address)

    await lock.purchaseFor(keyOwner, {
      from: keyOwner,
      value: await lock.keyPrice(),
    })
  })

  it('Key owner can call the function', async () => {
    await featureContract.paidOnlyFeature({
      from: keyOwner,
    })
  })
})
```

This line does all the heavy lifting for you:

```javascript
lock = await protocols.unlock.createTestLock(
  web3,
  accounts[9], // Unlock Protocol owner
  accounts[1], // Lock owner
  {
    keyPrice: web3.utils.toWei('0.01', 'ether'),
  }
)
```

It deploys the Unlock Protocol, creates a Lock to use for testing, and returns a contract instance for interacting with the Lock… as shown with the `purchaseFor` line. With this you can now test as you normally would.

If you want to step it up a notch here are a few mays you might monetize your contracts with Unlock:

- Unlock a discount on future transactions (or maybe make it free for key owners).
- Unlock usage limits, such as defaulting to a free trial which enables 1 tx per day per account. Key owners unlock unlimited calls.
- Unlock better odds, e.g. when rolling a DnD die key owners get +2 bonus on the roll.

Here's a few [example-contracts](https://github.com/unlock-protocol/unlock/tree/master/smart-contract-extensions/contracts/unlock-examples) with both contracts and sample tests to help you get started.

Want to do this for your smart contract? Get in touch we’d love to help you set it up: hello@unlock-protocol.com
