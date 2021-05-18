# unlock-js

Unlock-js is a npm module which provides a wrapper around the Unlock smart contract APIs.

It can used both on server side (node.js) applications and front end applications.

The module provides 2 classes: web3Service and walletService.

It covers some of the data type conversions so that API calls are more user friendly (strings instead of BigInts), as well as manages the multiple versions of the smart contracts.

The `/examples` folder includes some examples of how to use the library.

## web3Service

web3Service provides a "read only" API which lets app developers query Unlock's smart contracts (both Unlock and Locks).

Functionalities:
* Generating new lock address
* Retrieving transaction from hash
* Getting balance of an address (both Eth and tokens)
* Retrieving lock info
* Retrieves lock manager status for an address
* Retrieves key for a lock and address

## walletService

walletService provides a mechanism to send transactions and sign messages for a user. walletService requires the use of a web3 provider which encapsulating the user's wallet information.

Functionnalities:
* create a lock
* update the key price on a lock
* withdraw funds
* purchase a key


## Updating unlock-js to support a new smart contract version

When a new smart contract version is released, there are a few steps needed to enable the unlock-js library to use it.

1. update the `scripts/compressAbi.js` script to import and auto-generate
   the new version in `src/abi.js`, `src/bytecode.js` and in `src/__tests__/helpers/bytecode.js`
2. re-run `yarn build` to generate the new contract abi and bytecode
3. copy the newest directory of smart contract functions and rename it.
   For example, `src/v02` to `src/v03`
4. update the `index.js` in the new `src/v03` (or whatever version it is) directory to use
   the right abi version, and change the exported version
5. add the directory as an import in `src/unlockService.js`
6. update `lockContractAbiVersion()` and `unlockContractAbiVersion()` to return the new contract versions
   (also in `unlockService.js`)
7. update `web3Service.test.js` to test against the new contract versions
   (search for `describe.each`)
8. update `walletService.test.js` to test against the new contract versions (look at the last test)
9. profit
