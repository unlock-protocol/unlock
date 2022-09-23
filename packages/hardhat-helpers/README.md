# Hardhat helpers

This package contains a bunch of convenience helpers that can be used accross various hardhat project to add various tasks, parse networks file, verification APis, etc.

### Usage

```js
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const { networks, etherscan } = require('@unlock-protocol/hardhat-helpers')

module.exports = {
  networks, // add all supported networks info (RPCs, etc) for Unlock
  etherscan, // parse all verification APIs
}
```

### CLI tasks

Importing the package will provide a bunch of cli tasks

```sh
# show hardhat config in terminal
yarn hardhat config

# output hardhat config as json
yarn hardhat config --json
```

### Verification

You need to export the API keys in your env for it to work properly

```js
// 'mainnet', 'ropsten', 'rinkeby', 'goerli', 'kovan'].forEach(
ETHERSCAN_API_KEY

// polygon mumbai
POLYGONSCAN_API_KEY

// binance bsc
BSCSCAN_API_KEY

// optimism
OPTIMISTIC_ETHERSCAN_API_KEY

// arbitrum
ARBISCAN_API_KEY

// celo
CELO_API_KEY

// avalanche
SNOWTRACE_API_KEY
```
