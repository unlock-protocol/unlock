# Changes

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

- Removed `partialWithdraw` since it is unused and, starting from v11, `withdraw` implements the required logic
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

- Adding support for v11 of the smart contracts.

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
