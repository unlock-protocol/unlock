# Networks

Contains useful addresses and info about Unlock on different networks.

## Usage

```js
// by name
import { goerli } from '@unlock-protocol/networks'

// prefix by chain id
import networks from '@unlock-protocol/networks'
console.log(networks[1].name) // mainnet
```

## Dev

```
yarn start
```

## Scripts

- Check that networks are configured correctly: `yarn run check`. Some networks might be missing some properties.

- Check that all tokens have the right values (symbol, name, decimals): `yarn run check-tokens`
  (Use [this Dune Dashboard](https://dune.com/denze/evms-top-erc20s) to find popular coins!)
