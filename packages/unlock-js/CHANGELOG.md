# Changes

# 0.40.1

- adding missing ABI for locksmiths

# 0.40.0

- adding `latestTokenOfOwner`

# 0.39.4

- add `referrerFees` to `lock` in subgraphs

# 0.39.3

- handling cases where `supply` is larger than `maxNumberOfKeys` when calling `updateLockConfig`.

# 0.39.2

- add `createLock` accepts keyPrice as number
- `maxNumberOfKeys` is optional when creating a lock. If not passed will use unlimited.

# 0.39.1

- add `getDiscountHookValues` to web3Service
- add `setDiscountCodeHookSigner` to walletService

# 0.39.0

- Add support for setGasRefundValue to walletService and getGasRefundValue to web3Service

# 0.38.2

- Add `getTokenIdFromTx` method to retrieve the tokenId from a transaction hash

# 0.38.1

- Add `transferFrom` to walletService

# 0.38.0

- Add support for swap and purchase in key extension

# 0.37.2

- USDC on Polygon does not have a version function

# 0.37.1

- fixing swap and purchase

# 0.37.0

- adding support for actual purchase through CardPurchaser

# 0.36.1

- fix decimals for withdrawFromLock

# 0.36.0

- adding support functions for Transfer With Authorization
- adding support for CardPurchaser contract

# 0.35.5

- Removed signDataPersonal

# 0.35.4

- Adding missing implementations for v13: addKeyGranter, isKeyGranter

# 0.35.3

- Expose more fields such as `symbol`, `maxKeysPerAddress` and `maxNumberOfKeys` in subgraph service for locks fields.

# 0.35.1

- fixed upgrade function

# 0.35.0

- Add support for `swap` param in `purchaseKey` and `purchaseKeys` for swap and pay.
- add support for Unlock v12

# 0.34.1

- add support for `setKeyManagerOf` to walletService

# 0.33.4

- move `customHookService` to web3Service
- add `getPasswordHookSigners` to web3Service
- move `setPasswordHookSigner` to walletService

# 0.33.4

- add `customHookService`

# 0.33.3

- remove `getEthAddressType` to web3Service
- remove `isValidEOA` to web3Service
- refactor `resolveName`

# 0.33.2

- add `getEthAddressType` to web3Service
- add `isValidEOA` to web3Service
- add `resolveName` to web3Service

# 0.33.1

- ensuring we return a contract or throw!

# 0.33.1

- Move to ethers.JsonRpcBatchProvider instead of ethers.JsonRpcProvider

# 0.33.0

- Remove subgraph service

# 0.32.18

- Add KeyManager for interacting with key manager contracts.

# 0.32.17

- Add getBaseTokenURI to web3Service

# 0.32.15

- Add ability to pass recurring payment and total approval to extend key

# 0.32.13

- Export utility types for subgraph service

# 0.32.11

- add `updateTransferFee` in walletService

# 0.32.10

- add `referrerFees` in web3Service
- add `setReferrerFee` in walletService

# 0.32.9

- add `publicLockLatestVersion` in web3Service
- add `upgradeLock` in walletService

# 0.32.8

- fix `updateRefundPenalty` and `renounceLockManager` in walletService

# 0.32.7

- add `setEventHooks` in walletService
- add `onKeyCancelHook` in web3Service
- add `onKeyPurchaseHook` in web3Service
- add `onKeyTransferHook` in web3Service
- add `onKeyTokenURIHook` in web3Service
- add `onValidKeyHook` in web3Service
- add `onKeyExtendHook` in web3Service
- add `onKeyGrantHook` in web3Service

# 0.32.6

- increased robustness by checking address format on events

# 0.32.5

- add `updateRefundPenalty` in walletService
- add `freeTrialLength` in web3Service
- add `refundPenaltyBasisPoints` in web3Service

# 0.32.4

- Using `transactionOptions` for `createLock`

# 0.32.3

- Pass network property on locks and keys returned from subgraph.

# 0.32.1

- Change parameter name for `updateLockSymbol`

# 0.32.0

Allow passing creator in the createLock method and improve typing.

# 0.31.6

- add `addLockManager` in walletService
- add `renounceLockManager` in walletService

# 0.31.5

- Added suppport for `runEstimate`

# 0.31.4

- Add check to ensure lock is deployed from unlock factory contract in getLock method

# 0.31.2

- Add uniswap service
- Add consultUniswap method to web3 service for getting price of a token using uniswap v3 pools

# 0.31.1

- add `totalKeys` to subgraph
- support tokenAddress in `getAddressBalance`

# 0.31.0

- Add support for PublicLock version 12

# 0.30.6

- Add support for `key` and `lock` function in subgraph service.

# 0.30.5

- Add purchasePriceFor in web3Service

# 0.30.4

- Add support for `updateLockName`, `updateLockSymbol` and `setBaseTokenURI` across versions

# 0.30.3

- When no version is supplied, deploy the latest version of template.

# 0.30.2

- Add totalApproval option in purchase method

# 0.30.1

- Add `address` to schema.graphql

# 0.30.0

- Add subgraph service

# 0.29.3

- Breaking change in the locksmith service configuration export

# 0.28.3

- Add support for locksmith service.

# 0.28.2

- add support for `transferFeeBasisPoints`
- move `getCancelAndRefundValueFor` from `walletService` -> `web3Service`

# 0.28.1

- Preserving gas calculation when previous configured on purchase

# 0.27.0

- adding support for TransactionOptions when sending transactions. Also introducing the ability to use `runEstimate` to check if a transaction succeeds and how much gas it consumes

# 0.26.10

- add `keyPrice` parameter for `updateKeyPrice` and fix type definitions

# 0.26.9

- add support for `totalSupply`

# 0.26.8

- add support for `renewMembershipFor`

# 0.26.7

- add support for `keysAvailable`

# 0.26.6

- add support for `tokenURI`

# 0.26.5

- add support for `publicLockVersion`

# 0.26.4

- add support for `totalKeys`

# 0.26.3

- Add typing for referer in purchase key methods

# 0.26.2

- add support for `numberOfOwners`

# 0.26.1

- Fixed bug in allowance function

# 0.26.0

- add support for `approveBeneficiary`
- pass address as param to `getAllowance` instead of signer

# 0.25.0

- Better support for v10

# 0.24.0

- Removed hard coded gas limit and waits on erc20 approvals
- Add locksmithService for interacting with locksmith servers.
- Rescuing gas estimation errors
- Add support for granting multiple keys

# 0.23.1

- add support for publicLock v10
- add ability for all versions to purchase multiple keys at once with `purchaseKeys`
- add support for `extendKey`, `setMaxKeysPerAddress`, `mergeKeys`
- refactor functions us emultiple times in `./src/PublicLock/utils` folder

# 0.23.0

- add Unlock v11 and ability to create lock at specific version
- Non expired keys are represented as -1
- Gas price calculation fixes
- Adding support for unlimited durations when granting keys
- Adding transactionOptions on the grantKeys function

# 0.22.2

- Add support for setExpirationDuration

# 0.21.2

- Better support for locks with infinite duration

# 0.21.1

- Fixed dependencies in package.json

# 0.21.0

- Updated docs
- Updated dependencies
- Add setMaxNumberOfKeys support
- add support for publicLock v9
- add new Unlock v10 upgradeable logic

# 0.20.6

- Bumped gas limit to be 40% higher than estimate

# 0.20.5

- remove `deployUnlock`, `configureUnlock` and `deployTemplate` from walletService

# 0.20.4

- @unlock-protocol/networks is a dev dependency

# 0.20.3

- Adding forced estimate for gas which includes gas price because it matters for execution

# 0.20.2

- Adding forced estimate for gas

# 0.20.0

- removed metadata functions (breaking change)

# 0.19.3

- Removed hard coded gas amounts when applicable

# 0.19.2

- Updated API calls to locksmith to add chain

# 0.19.1

- removed erc1820 to remove scrypt so we ccan support newer node versions

# 0.19.0

- Support v9
- better inheritance pattern
- removed dev dependencies
- Removed limitation in node version

# 0.18.2

- Adding way to get the contract in web3Service (`lockContract(lockAddress, network)`)
- Adding `ownerOf(lockAddress, tokenId, network)` to retrieve the owner of a token

# 0.18.1

Fixed grantKey when timestamp was not supplied.

# 0.18.0

Now using Ethers 5!

# 0.17.0

- Adding ability to grant key granter status
- Adding ability to check if address is key granter
- Adding ability to cancel key by key owner
- Adding ability to cancel key by lock owner
- Adding ability to share key by key owner
- Adding ability to retrieve key manager for key

# 0.16.3

- Fixing unlockAddress in walletService

# 0.16.2

- WalletService sets the unlock contract address based on connected network

# 0.16.1

- Breaking change: support for multichains.
- Typescript definition fix

# 0.16

- Breaking change: support for multichains.

# 0.15.2

- Typescript definition fix

# 0.15.1

- Typescript definition fix

# 0.15.0

- various API changes

# 0.14.0

- fixing approvals for ERC20 key purchases

# 0.13.3

- Updating types for key purchase function

# 0.13.2

- Bumping default gas prices for key purchases

# 0.13.1

- Adding referrer for v6, v7 and v8
- Adding data for v6, v7 and v8

# 0.13.0

- Introduced support for v8
- Removed v0, v1, v2, v3, v5.

# 0.12.2

- Small fix to make sure inputs are defined

# 0.12.1

- Awaiting for transaction input to be parsed for richer object

# 0.12.0

- Refactored getTransaction to yield a promise of transaction object and does not emit events anymore

# 0.11.0

- Better implementation of unformattedSignTypedData
- Removed getKeysForLockOnPage (breaking change)
- Removed getPastLockTransactions (breaking change)
- Removed getPastLockCreationsTransactionsForUser (breaking if you're using it!)

# 0.10.2

- Fixing unlock provider handling inside of WalletService

# 0.10.1

- Support Ether providers and signers in WalletService

# 0.10.0

- adding support for grantKey function
- adding ability to pass signer

# 0.9.3

- Exporting type definition for isLockManager

# 0.9.2

- Adding isLockManager function to web3Service

# 0.9.1

- Replaced owner with beneficiary for locks

# 0.9

- Adding support for v7 of PublicLock and Unlock smart contracts

# 0.8.7

- Updated typescript definitions

# 0.8.6

- Callback on transaction yields the transaction object as 3rd argument

# 0.8.5

- Corrected type definition so that callback is optional on purchaseKey

# 0.8.4

- Updated WalletService type to include callback for purchaseKey

# 0.8.3

- Updated Web3ServiceParams to include the network id, which is required

# 0.8.2

- Hardcoding the symbol for SAI

# 0.8.1

- Addition of setUserMetadata, which follows the same argument pattern
  as the other metadata methods

# 0.8.0

- BREAKING: getKeyMetadata now takes an object for non-callback
  params, now including an optional signature to retrieve protected metadata
- BREAKING: setKeyMetadata takes an object for non-callback params to
  keep calling conventions consistent for the setter and the getter

# 0.7.2

- bumped gas limits
- Adding script to initialize a template

# 0.7.1

- Code cleaned witth automated linting fixes
- Adjusted lint config to ignore violations that could not be fixed auttomatically
- Added setKeyMetadata and getKeyMetadata methods to WalletService
- Update gas prices

# 0.7.0

- Adding support for ABI version 1.3
- Added typed data templates for key-related metadata upload requests

# 0.6.0

- removed unlockProvider as it has moved back to unlock-app

# 0.5.4

- generateLockAddress on inputHandler as well

# 0.5.3

- Supports create2 in generateLockAddress

# 0.5.2

- Lets the user pass a network id when intantiating services

# 0.5.1

- Changed auto-gen files to reflect latest abi

# 0.5.0

- Support for smart contract v5 (version 5)
- Deprecated the deploy script in favor of using walletService
- Adding support for configureUnlock to support version 12
- Adding support for deployTemplate to support version 12 which reduces gas costs when deploying new locks
- Added type definitions for currently exported members

# 0.4.2

- Fixing issue with generateSignedEjectionRequest which did not yield the actual user address

# 0.4.1

- Adding a "latest" export which returns the latest supported lock version
- Loosening the required node version to anything compatible with v10

## 0.4.0

- Only approving if the approved amount is lower than the required price
- WalletService method which change state take a callback as argument which yields the transaction hash.
- Not catching errors on transaction emitted. These should be caught by the applications
- withdrawFromLock now returns a Promise of the withdrawn amount
- purchaseKey now returns a Promise of the token id
- createLock now returns a Promise of the deployed lock address
- updateKeyPrice now uses the right decimals for erc20 contracts
- getting erc20Address and decimals from the contract when purchasing a key
- Removed the 'owner' param on createLock since it is not really used (just emitted back)
- Refactored signature to accept objects to be more flexible (this is a breaking change)

## 0.3.20

- unlock-provider can generate a signed ejection request

## 0.3.19

- unlock-provider has a more consistent personal_sign output

## 0.3.18

- walletService dispatches personal_sign to unlock-provider

## 0.3.17

- unlock-provider can personal_sign data

## 0.3.16

- Using the right decimals number for ERC20 balances

## 0.3.15

- TODO cleanup in web3Service tests
- Randomizing retries on error 419 (rate limiting)
- Hanlding missing ERC20 methods

## 0.3.14

- Adding retries on error 419 (rate limiting)

## 0.3.13

- Returning the token symbol when retrieving an ERC20 lock.

## 0.3.12

- fixed a difference between pending transactions (node knows about them) and submitted transactions (which may be transactions that have been cancelled and will never succeed)

## 0.3.11

- add `getTokenSymbol` method to web3Service to identify arbitrary ERC20 tokens (#4481)
- add `getTokenBalance` method to web3Service to get the user's balance of arbitrary ERC20 tokens (#4431)

## 0.3.10

- Add "for" field for pending/submitted key purchase transactions (#4190)
- ignore events from other contracts (erc20 for instance) (#4187)

## 0.3.9

- If a transaction is unknown poll immediately for it (#4149)

## 0.3.8

- Moved scrypt/N back to the default from Web3 for speed of account interaction

## 0.3.7

- Add "for" field for key purchase transactions to describe who the key was purchased for

## 0.3.6

- Bugfix: using the right default amount on withdraw when no amount has been provided

## 0.3.5

- Bugfix: key purchase request signatures are no longer always expired

## 0.3.4

- Bugfix: using correctly formatted structured data for key purchase requests

## 0.3.3

- UnlockProvider gains the capability to sign key purchase requests

## 0.3.2

- UnlockProvider gains a `signPaymentData` method that will allow it to sign
  payment details in a way that locksmith can verify and associate with the user

## 0.3.1

- walletService now emits an `account.updated` event with an account's email
  address if available

## 0.3.0

- erc20 transfer approval returns immediately
- UnlockProvider now stores user email address and encrypted private key
- UnlockProvider gains new methods for signing typed data, replacing the old
  strategy of intercepting JSON-RPC calls

## 0.2.9

- Fixing approvals

## 0.2.8

- Approving the right amount when using an ERC20 lock

## 0.2.7

- Removed `partialWithdraw` since it is unused and, starting from v4, `withdraw` implements the required logic
- `getLock` yields the lock name from the on chain data.

## 0.2.6

- `UnlockProvider` now inherits from `ethers.providers.JsonRpcProvider` instead
  of storing one as a property.

## 0.2.5

- Allow `walletService` to properly connect to `UnlockProvider`
- Provides pre-purchase approval for the purchase of ERC20 keys

## 0.2.4

- Increased gas limit to deploy Unlock contract

## 0.2.3

- Adding support for v4 of the smart contracts.

## 0.2.2

- `unlock-provider` gains a property `isUnlock` that will allow Unlock-specific
  provider configuration.

## 0.2.1

- getLock now returns the erc20 balance for erc20 locks
- `unlock-provider` gains a method allowing handling of `eth_signTypedData`

## 0.2.0

- Introducing unlock-provider to enable use of user accounts

## 0.1.5

- Yielding the Lock version on getLock, as publicLockVersion

## 0.1.4

- Yielding the ERC20 contract if the lock is an ERC20 lock

## 0.1.3

- Changing the createLock API to remain consistent

## 0.1.2

- Updated gas amounts to fix deploying new locks

## 0.1.1

- Version bump after publishing older code inside 0.1.0

## 0.1.0

- Adds support for v1.0 of Unlock.sol and PublicLock.sol. Lock names can now be passed when creating
  them

## 0.0.33

- Introduce a constant that sets the `N` property of `scrypt` in the `Crypto`
  section of the `Wallet.encrypt` options parameter to `1 << 16` -- this value
  being a compromise between the `web3.js` default (very fast) and the `ethers`
  default (very secure).
- Update `createAccountAndPasswordEncryptKey` to use this new constant

## 0.0.32

- Actually export the function that re-encrypts a private key.

## 0.0.31

- `getTransaction` no longer crashes if the user refreshes while a key purchase transaction is pending
- moved `recoverAccountFromSignedData` to `web3Service`

## 0.0.30

- `web3`-only version for tickets app
- move signature verification from `walletService` to `web3Service`

## 0.0.29

- `getAccountFromPrivateKey` now returns the entire `Wallet`, not just the `SigningKey`
- implemented `reEncryptPrivateKey`, which can be used to change the password an
  account is encrypted with.
- Updates lock creation interface to support other backing contracts

## 0.0.28

- Modified recoverAccountFromSignedData to include callback API
- web3 branch for use with tickets app - do not use for other projects

## 0.0.27

- fix "submitted" state for transaction-based methods like `purchaseKey` in `walletService`
- implement signature verification with `recoverAccountFromSignedData` in `walletService` (etherrs)

## 0.0.26

(legacy web3 release, for tickets app only)

- implement signature verification with `recoverAccountFromSignedData` in `walletService`

## 0.0.25

- Add an esm build
- `getKeyByLockForOwner` returns the value as well as emitting
- heavy dependencies on `unlock-abi-0*` are removed in favor of a compressed
  build of the contract abi and bytecode
- unlock-js no longer has references to `XMLHttpRequest` and uses `fetch` instead
  so that it can run in any context. It falls back to `XMLHttpRequest` or node `http`
  if `fetch` does not exist
- `deploy` can now accept a contract version like `'v02'` instead of the whole contract

## 0.0.24

- migrated from `web3` to `ethers`

## earlier versions

These are legacy and should not be installed.
