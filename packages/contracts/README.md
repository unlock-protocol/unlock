# Contracts

### Javascript usage

```js
// get latest
import unlock from '@unlock-protocol/contracts/Unlock'

// get previous versions
import unlock from '@unlock-protocol/contracts/UnlockV0'
import { UnlockV0 } from '@unlock-protocol/contracts'
```

### Solidity usage

NB: all the contracts have been flattened and exist mostly for archiving.

```solidity

import "@unlock-protocol/contracts/Unlock/UnlockV0.sol";

```

## Build the package

After adding a contract, you need to append the file to the index by running:

```
yarn build:index
```

### Run Tests

Make sure all the contracts are building correctly by running

```
yarn test
```

### Build the docs

Output documentation for Unlock and PublicLock in the `/docs` folder

```
yarn docs
```
