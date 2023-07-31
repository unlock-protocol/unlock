---
title: Deploying Locally
description: A deploying the Unlock Protocol set of contracts locally.
---

For this you need to use our [Hardhat plugin](../../tools/hardhat-plugin.md).

Once installed, you can access the Unlock plugin directly from the Hardhat Runtime Environment
anywhere you need it (tasks, scripts, tests, etc).

```solidity
import { unlock } from "hardhat";

// deploy the Unlock contract
await unlock.deployUnlock();

// deploy the template
await unlock.deployPublicLock();

// deploy the entire protocol (localhost only)
await unlock.deployProtocol();

// create a lock
const lockArgs = {
  expirationDuration: 60 * 60 * 24 * 7, // 7 days
  currencyContractAddress: null, // null for ETH or erc20 address
  keyPrice: "100000000", // in wei
  maxNumberOfKeys: 10,
  name: "A Demo Lock",
};
await unlock.createLock(lockArgs);
```

## Command Line Interface

The plugin also comes with a few CLI commands to help you get things started.

To get the complete list of available commands

```shell
 yarn hardhat
```

Deploy and configure the Unlock contracts

```shell
yarn hardhat unlock:deploy --network localhost
```

Display info about an existing lock

```shell
yarn hardhat lock:info --lock-address 0xe7cb5e2e538fec1492b66f180fac6d4106991250 --network mainnet

LOCK
  - name: 'Raffle Ronin'
  - address: 0xe7cb5e2e538fec1492b66f180fac6d4106991250
  - price: 0.05 ETH
  - duration: 82 years, 1 month, 2 weeks, 5 days, 1 hour, 30 minutes
  - keys: 23 / ∞
  - currency: ETH
  - balance: 0.15
  - symbol: UDT
  - version: 8
✨  Done in 11.75s.

```
