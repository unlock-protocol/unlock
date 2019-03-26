# unlock-js

Unlock-js is a npm module which provides a wrapper around the Unlock smart contract APIs.

It can used both on server side (node.js) applications and front end applications.

The module provides 2 different classes: web3Service and walletService.

## web3Service

web3Service provides a "read only" API which lets app developers query Unlock's smart contracts (both Unlock and Locks).

## walletService

walletService provides a mechanism to send transactions and sign messages for a user. walletService requires the use of a web3 provider which encapsulates the users' wallet information.

## HOW TO

The code is written using es6 and exported after it's been transpiled to older versions of JS using babel.
You can run test using `npm run test` and you need to run `npm run build` in order to generate the new transpiled code.

## TODO

- switch away from web3.js. (the current version beta.37 we use is outdated and seems very different the latest beta - beta.50 as of now)
- rename components and hide the complexity
- Typescript-ify for robustness
