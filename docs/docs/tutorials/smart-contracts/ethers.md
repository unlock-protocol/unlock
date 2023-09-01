---
title: Using Ethers for Unlock Protocol
description: >-
  In this tutorial, we will see how to use Unlock's contract with the popular Ethers library.
---

# Using Unlock Protocol's contract with Ethers

[Ethers](https://docs.ethers.io/) is a popular Ethereum library written in JavaScript. It lets developers easily integrate Ethereum smart contracts in their applications.

In order to "read" state from the blockchain, Ethers requires the use of a provider. Different providers are required for different networks that a contract might be deployed to.

Similarly, if you are trying to modify the state of a contract, you will need to use a "signer", connected to a provider.

## Accessing the contracts ABI

The ABI is a description of all functions supported by a smart contract. Ethers uses an ABI to "construct" JavaScript objects that map to the smart contracts. All of the Unlock contracts are not only open source but also verified on Etherscan. This means you can easily retrieve their ABI from there. (You can also use our `@unlock-protocol/contracts` package).

It is also possible to use JSON files to provide an ABI.

## Basic Example

In this first example, we want to read state from a specific lock deployed on Goerli. We're using a provider that allows you to easily create connections to many different blockchains [Infura](https://infura.io/) but you could just as easily use [Ankr](https://www.ankr.com/) or [Tatum](https://tatum.io/).

```javascript
const ethers = require("ethers");
const abis = require("@unlock-protocol/contracts");

// Wrapping all calls in an async block
const run = async () => {
  // Here we use a Goerli provider. We will be able to read the state, but not send transactions.
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.unlock-protocol.com/5"
  );

  // We will interact with a lock deployed on Goerli at this address 0x09A8F16Ed16C28f4774aBF73eCc071cfB423Ac24
  // Using Etherscan, we know that this is a lock of version 8, so we will load the corresponding ABI.
  const address = "0x09A8F16Ed16C28f4774aBF73eCc071cfB423Ac24";

  const lock = new ethers.Contract(address, abis.PublicLockV11.abi, provider);

  // After that we can read the state of the lock, using methods from its ABI:
  console.log(await lock.symbol()); // => "KEY"
  console.log(await lock.name()); // => "Unlock Times"
};
run();
```

## Finding the lock version

Even though the ABI differs between every version, some functions are shared between _all lock_ versions in order to simplify compatibility. One of them is `publicLockVersion`. You can then easily retrieve the version of a lock with the following.

```javascript
const ethers = require("ethers");

// Simplest version of a lock's ABI
const PublicLockAbi = [
  {
    constant: true,
    inputs: [],
    name: "publicLockVersion",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
];

// Wrapping all calls in an async block
const run = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.unlock-protocol.com/5"
  );
  const address = "0x09A8F16Ed16C28f4774aBF73eCc071cfB423Ac24";
  const lock = new ethers.Contract(address, PublicLockAbi, provider);

  console.log((await lock.publicLockVersion()).toString()); // => 11
};
run();
```

Note in the example above that `await lock.publicLockVersion()` returns a `BigNumber` which we convert to a string using [Ethers' helper](https://docs.ethers.io/v5/api/utils/bignumber/) `toString().

## Purchasing a membership NFT

When writing an application, you may want to modify the state of a Lock. The simplest and most common state modification is to purchase a membership. Here is a detailed example.

```javascript
const ethers = require("ethers");
const abis = require("@unlock-protocol/contracts");

// Wrapping all calls in an async block
const run = async () => {
  // Here we use a Goerli provider. We will be able to read the state, but not send transactions.
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.unlock-protocol.com/5"
  );

  // This time, we also need a signer.
  // Note: we sent some fake Eth to this address, but please replace with your own!
  const wallet = ethers.Wallet.fromMnemonic(
    "seed cube fiction obvious cover riot edge beauty pelican radio useful strong"
  );

  const signer = wallet.connect(provider);

  // We will interact with a lock deployed on goerli at this address 0x09A8F16Ed16C28f4774aBF73eCc071cfB423Ac24
  const address = "0x09A8F16Ed16C28f4774aBF73eCc071cfB423Ac24";

  // Let's go purchase the membership for this lock
  const lock = new ethers.Contract(address, abis.PublicLockV11.abi, signer);

  // If the lock was using an ERC20 as currency, we would need to send an approval transaction on the ERC20 contract first...

  // Let's get the key price so we know how much we need to send (we could send more!)
  const amount = await lock.keyPrice();

  // Purchase params:
  // The purchase function in v11 supports making multiple purchases... here we just pass a single one.
  const purchaseParams = [
    [amount],
    [wallet.address], // This is the recipient of the membership (us!)
    [wallet.address], // The is the referrer who will earn UDT tokens (we'd like this to be us!)
    [ethers.constants.AddressZero], // The key manager. if 0x0, then it is the recipient by default
    [[]], // empty data object (not used here)
  ];

  const options = {
    value: amount, // This is a lock that uses Ether, so it means we need send value. If it was an ERC20 we could set this to 0 and just use the amount on purchase's first argument
  };

  // We can now send transactions to modify the state of the lock, like purchase a key!
  const transaction = await lock.purchase(...purchaseParams, options);
  console.log(transaction.hash);
  const receipt = await transaction.wait();
  console.log(receipt);
};
run();
```

All in all, if you are already using Ethers, all of this should be pretty familiar!

## Deploying new Membership contract

New Locks are deployed using the Unlock contract (it is a factory contract). For this, it is recommended to use the `createUpgradeableLockAtVersion` function. This function deploys a lock at a specific version and takes 2 arguments: a blob of all the arguments and the version number.

Here we deploy locks in version 11:

```javascript
const ethers = require("ethers");
const abis = require("@unlock-protocol/contracts");

// Wrapping all calls in an async block
const run = async () => {
  // Here we use a Rinkeby provider. We will be able to read the state, but not send transactions.
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.unlock-protocol.com/5"
  );

  // This time, we also need a signer.
  // Note: we sent some fake Eth to this address, but please replace with your own!
  const wallet = ethers.Wallet.fromMnemonic(
    "seed cube fiction obvious cover riot edge beauty pelican radio useful strong"
  );

  const signer = wallet.connect(provider);

  // On goerli Unlock is at
  const address = "0x627118a4fB747016911e5cDA82e2E77C531e8206";

  // Instantiate the Unlock contract
  const unlock = new ethers.Contract(address, abis.UnlockV11.abi, signer);

  // Lock params:
  const lockInterface = new ethers.utils.Interface(abis.PublicLockV11.abi);
  const params = lockInterface.encodeFunctionData(
    "initialize(address,uint256,address,uint256,uint256,string)",
    [
      signer.address,
      31 * 60 * 60 * 24, // 30 days in seconds
      ethers.constants.AddressZero, // We use the base chain currency
      ethers.utils.parseUnits("0.01", 18), // 0.01 Eth
      1000,
      "New Membership",
    ]
  );

  const transaction = await unlock.createUpgradeableLockAtVersion(params, 11);
  console.log(transaction.hash);
  const receipt = await transaction.wait();
  const lockAddress = receipt.logs[0].address;
  console.log(lockAddress);
};
run();
```
