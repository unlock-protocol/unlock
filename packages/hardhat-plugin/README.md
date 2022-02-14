# Unlock Hardhat plugin

_Unlock hardhat plugin provides a set of tasks and scripts to interact directly with the [Unlock Protocol](https://unlock-protocol.org)_


## Installation

```bash
yarn install @unlock-protocol/hardhat-plugin
```

Import the plugin in your `hardhat.config.js`:

```js
require("@unlock-protocol/hardhat-plugin");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@unlock-protocol/hardhat-plugin";
```

## Configuration

### Networks

Info about already deployed Unlock contracts (on mainnet, rinkeby, optimism, bsc,xdai/gnosis, etc.) are added to the `unlock` param of the hardhat config. You can pass custom info about your own Unlock deployments directly in `hardhat.config.js` - following the `NetworkConfig` type in `@unlock-protocol/types`.

#### Config example 

```js
import "@unlock-protocol/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: '0.8.7',
  unlock: {
    31337: {
      name: 'Custom Localhost Name',
    },
    12345: {
      name: 'My New Network',
      unlockAddress: '0x...', // your own unlock deployment address
    },
  },
}
```

### Signer

By default, the first hardhat accounts will be used.  
You can also pass a private key as follow by exporting `WALLET_PRIVATE_KEY` to the environment

```
export WALLET_PRIVATE_KEY=xxx
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
  name: 'A Demo Lock'
}
await unlock.createLock(lockArgs)
```
