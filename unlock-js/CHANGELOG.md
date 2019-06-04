# Changes

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
