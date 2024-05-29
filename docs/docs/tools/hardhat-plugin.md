---
description: >-
  To simplify the development of applications based on Unlock Protocol, we created a simple library for Hardhat. It allows to easily deploy the protocol locally to test things, or manipulate existing locks and contracts from scripts and the command line.
sidebar_label: Hardhat Plugin
---

To simplify the development of applications based on Unlock Protocol, we created a simple library for [Hardhat](https://hardhat.org/). It allows to easily deploy the protocol locally to test things, or manipulate existing locks and contracts from scripts and the command line.

## Install

```shell
npm i @unlock-protocol/hardhat-plugin
```

or

```shell
yarn add @unlock-protocol/hardhat-plugin
```

Import the plugin in your `hardhat.config.js`:

```js
require('@unlock-protocol/hardhat-plugin')
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import '@unlock-protocol/hardhat-plugin'
```

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access ethers through the Hardhat Runtime Environment anywhere
you need it (tasks, scripts, tests, etc).

```js
import { unlock } from 'hardhat'

// deploy the Unlock contract
await unlock.deployUnlock()

// deploy the template
await unlock.deployPublicLock()

// deploy the entire protocol (localhost only)
await unlock.deployProtocol()

// create a lock
const lockArgs = {
  expirationDuration: 60 * 60 * 24 * 7, // 7 days
  currencyContractAddress: null, // null for ETH or erc20 address
  keyPrice: '100000000', // in wei
  maxNumberOfKeys: 10,
  name: 'A Demo Lock',
}
await unlock.createLock(lockArgs)
```

You can also use the plugin to import the Unlock contracts in your own contracts, like we do for example [when creating Hooks](../tutorials/smart-contracts/using-unlock-in-other-contracts.md).

```solidity

// Importing the PublicLock interface
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";

contract MyContract {
  constructor(_lock) {
    // Check if the sender is a manager on the lock passed as argument
    IPublicLockV13(_lock).isLockManager(msg.sender)
  }
}

```

## Configuration (optional)

### Networks

Info about already deployed Unlock contracts (on mainnet, optimism, bsc, xdai/gnosis, etc.) are added to the `unlock` param of the hardhat config. You can pass custom info about your own Unlock deployments directly in `hardhat.config.js`.

#### Config example

```solidity
import "@unlock-protocol/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  unlock: {
    12345: {
      name: "My New Network",
      unlockAddress: "0x...", // your own unlock deployment address
    },
  },
};
```

## Other Links

For more check the [plugin page](https://github.com/unlock-protocol/unlock/tree/master/packages/hardhat-plugin) or the [example repo](https://github.com/unlock-protocol/hardhat-plugin-example).
