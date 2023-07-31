---
sidebar_position: 4
title: Unlock.js
description: Guide to Unlock.js, an NPM module providing a wrapper around the Unlock Protocol smart contract ABI.
---

# Unlock.js

Unlock.js can be used both on server side (node.js) applications and front end applications.

Both the Unlock and the PublicLock contracts have been upgraded and support multiple versions. One of the core goals of the Unlock.js library is to provide an abstraction layer over these versions. In its default use, it also hides the complexity of dealing with Ethereum data formats as it yields (and accepts) values as base JavasScript types, such as strings, numbers or booleans.

## Installing in A Project

`npm i @unlock-protocol/unlock-js`

The module provides 2 different classes: `web3Service` and `walletService`.

## web3Service

`web3Service` provides a "read-only" API that lets app developers query Unlock's smart contracts (both Unlock and Locks).

## walletService

`walletService` provides a mechanism to send transactions and sign messages for a user. `walletService` requires the use of a web3 provider which encapsulates the user's wallet information.

## Examples

### Using Web3Service to retrieve a lock's details:

```javascript
const ethers = require("ethers");
const { Web3Service } = require("@unlock-protocol/unlock-js");

const networks = {
  5: {
    unlockAddress: "0x627118a4fB747016911e5cDA82e2E77C531e8206", // Smart contracts docs include all addresses on all networks
    provider: "https://rpc.unlock-protocol.com/5",
  },
};

async function run() {
  const web3Service = new Web3Service(networks);

  // This lock exists on Rinkeby (you can create one from the dashboard if needed)
  const lockAddress = "0xF735257c43dB1723AAE2A46d71E467b1b8a8422A";

  const lock = await web3Service.getLock(lockAddress, 4);
  //   {
  //     asOf: 10094781,
  //     name: 'May 4th 2021',
  //     publicLockVersion: 8,
  //     maxNumberOfKeys: -1, // -1 means Infinite
  //     expirationDuration: 345600,
  //     keyPrice: '0.01',
  //     beneficiary: '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44',
  //     balance: '0.02',
  //     outstandingKeys: 11,
  //     currencyContractAddress: null
  //   }
}

run();
```

### Using WalletService to deploy a lock

```javascript
const ethers = require("ethers");
const { WalletService } = require("@unlock-protocol/unlock-js");

const networks = {
  4: {
    unlockAddress: "0x627118a4fB747016911e5cDA82e2E77C531e8206", // Smart contracts docs include all addresses on all networks
    provider: "https://rpc.unlock-protocol.com/5",
  },
};

// Initializing RPC provider and connect it to Goerli
const provider = new ethers.providers.JsonRpcProvider(networks[5].provider);

// Create a wallet.
// This one should have a little bit of fake eth but please send more if you use it:
// 0x42fb30ae9694c45f76d98d01adf4103fc7b636a6
const wallet = new ethers.Wallet.fromMnemonic(
  "solid entry walnut extend aisle skirt myth clog need analyst edit bench"
).connect(provider);

async function run() {
  const walletService = new WalletService(networks);

  // Connect to a provider with a wallet
  await walletService.connect(provider, wallet);

  // This only resolves when the transaction has been mined, but the callback returns the hash immediately
  await walletService.createLock(
    {
      maxNumberOfKeys: 100,
      name: "testing silver",
      expirationDuration: 12121311,
      keyPrice: "0.01", // Key price needs to be a string
    },
    {}, // transaction options
    (error, hash) => {
      // This is the hash of the transaction!
      console.log({ hash });
    }
  );
}

run();
```

### Using WalletService to purchase a key:

```javascript
const ethers = require("ethers");
const { WalletService } = require("@unlock-protocol/unlock-js");

const networks = {
  4: {
    unlockAddress: "0x627118a4fB747016911e5cDA82e2E77C531e8206", // Smart contracts docs include all addresses on all networks
    provider: "https://rpc.unlock-protocol.com/5",
  },
};

// Initializing RPC provider and connect it to Goerli
const provider = new ethers.providers.JsonRpcProvider(networks[5].provider);

// Create a wallet.
// This one should have a little bit of eth but please send more if you use it:
// 0x42fb30ae9694c45f76d98d01adf4103fc7b636a6
const wallet = new ethers.Wallet.fromMnemonic(
  "solid entry walnut extend aisle skirt myth clog need analyst edit bench"
).connect(provider);

async function run() {
  const walletService = new WalletService(networks);

  // Connect to a provider with a wallet
  await walletService.connect(provider, wallet);

  // This lock exists on Rinkeby (you can create one from the dashboard if needed)
  const lockAddress = "0xF735257c43dB1723AAE2A46d71E467b1b8a8422A";

  // This only resolves when the transaction has been mined, but the callback returns the hash immediately
  await walletService.purchaseKey(
    {
      lockAddress,
    },
    {}, // transaction options
    (error, hash) => {
      // This is the hash of the transaction!
      console.log({ hash });
    }
  );
}

run();
```

The [Integration test suite](https://github.com/unlock-protocol/unlock/blob/master/packages/unlock-js/src/__tests__/integration/walletServiceIntegration.test.js) provides the most complete example of the supported actions:

- Deploying a lock
- Purchasing a key on the lock
- Changing the locks params
- Withdrawing from the lock
- ... etc

### Using the SubgraphService to query locks:

```javascript
const { SubgraphService } = require('..')

async function main() {
  const service = new SubgraphService()
  const locks = await service.locks(
    {
      first: 100,
      skip: 100,
    },
    {
      networks: [1, 5],
    }
  )
  console.log(locks)

  const keys = await service.locks(
    {
      first: 100,
      skip: 100,
    },
    {
      networks: [1, 5],
    }
  )
  console.log(keys)
}

main().catch(console.error)
```
