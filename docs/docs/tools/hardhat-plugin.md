---
description: >-
  To simplifiy the development of applications based on Unlock Protocol, we created a simple library for Hardhat. It allows to easily deploy the protocol locally to test things, or manipulate existing locks and contracts from scripts and the command line.
sidebar_label: Hardhat Plugin
---

To simplifiy the development of applications based on Unlock Protocol, we created a simple library for [Hardhat](https://hardhat.org/). It allows to easily deploy the protocol locally to test things, or manipulate existing locks and contracts from scripts and the command line.

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
require("@unlock-protocol/hardhat-plugin");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@unlock-protocol/hardhat-plugin";
```

## Configuration

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

For more check the [plugin page](https://github.com/unlock-protocol/hardhat-plugin-example) or the [example repo](https://github.com/unlock-protocol/hardhat-plugin-example).
