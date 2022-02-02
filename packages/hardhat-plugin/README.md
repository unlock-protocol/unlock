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

// deploy the protocol contract
await unlock.deployUnlock()

// deploy the template
await unlock.deployPublicLock()
```
