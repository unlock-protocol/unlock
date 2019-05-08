# unlock-js

Unlock-js is a npm module which provides a wrapper around the Unlock smart contract APIs.

It can used both on server side (node.js) applications and front end applications.

The module provides 2 different classes: web3Service and walletService.

## web3Service

web3Service provides a "read only" API which lets app developers query Unlock's smart contracts (both Unlock and Locks).

## walletService

walletService provides a mechanism to send transactions and sign messages for a user. walletService requires the use of a web3 provider which encapsulating the user's wallet information.

## HOW TO

The code is written using es6 and exported after it's been transpiled to older versions of JS using babel.
You can run test using `npm run test` and you need to run `npm run build` in order to generate the new transpiled code.

## TODO

- rename components and hide the complexity
- Typescript-ify for robustness

## Updating unlock-js to support a new smart contract version

When a new smart contract version is released, there are a few steps needed to enable the unlock-js library to use it.

1. update the `scripts/compressAbi.js` script to import and auto-generate
   the new version in `src/abi.js` and in `src/__tests__/helpers/bytecode.js`
2. re-run `npm run build` to generate the new contract abi and bytecode
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