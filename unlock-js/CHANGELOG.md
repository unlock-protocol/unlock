# Changes

## 0.0.29

- `getAccountFromPrivateKey` now returns the entire `Wallet`, not just the `SigningKey`
- implemented `reEncryptPrivateKey`, which can be used to change the password an
  account is encrypted with.
  
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
