# Contracts

### Javascript usage

```js
// get latest version
import { Unlock } from '@unlock-protocol/contracts'
import { PublicLock } from '@unlock-protocol/contracts'

// a previous version
import UnlockV12 from '@unlock-protocol/contracts/UnlockV12'
import { UnlockV12 } from '@unlock-protocol/contracts'

// all contracts
import { contracts } from '@unlock-protocol/contracts'

// the number of latest versions available
import {
  PUBLICLOCK_LATEST_VERSION,
  UNLOCK_LATEST_VERSION,
} from '@unlock-protocol/contracts'
```

### Solidity usage

NB: all the contracts have been flattened and exist mostly for archiving.

```solidity
import '@unlock-protocol/contracts/Unlock/UnlockV0.sol';
```

## Adding a contract

You can add a contract from the `smart-contracts` folder (which is used for development/testing) with the following command:

```bash
yarn hardhat release --contract contracts/<contract>.sol
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
