# Blockchain handler

The blockchain handler consists of several sub-components:

- account handling
- read-only retrieval of data
  - transactions from locksmith
  - locks from the chain
  - keys from the chain
- key purchase
  - sending the transaction
  - listening for transaction changes

# Account handling

The `accounts.js` file contains functions for account handling, most notably `pollForAccountChanges`

Other functionality are getters/setters for the local blockchain version of account and account balance

# Read-only retrieval

All of these functions require both account and network to be set. Initially, this will be retrieved from the cache,
and replaced with current values once the active wallet responds.

`locksmithTransactions.js` contains the functionality for retrieving transaction information from locksmith,
and also get the transaction from the chain.

`getLocks.js` contains the functionality for retrieving locks from the chain. For each lock, if a key does not
yet exist, a dummy expired key is created.

`getKeys.js` contains the functionality for retrieving keys.

# Keys and transactions

The key data structure contains these fields:

- `lock` The ethereum address of the lock this key unlocks
- `owner` The ethereum address of the account that purchased this key
- `id` A dummy value consisting of the lock and owner addresses separated by a hyphen. This is not the same as the
  key id on the smart contract. Since every owner may only have 1 key, this is used simply to track the metadata of the key
- `expiration` The seconds timestamp beyond which this key will be invalid
- `status` The key status. This will be one of:
  - `none` No key purchase has been attempted by this owner
  - `submitted` A key purchase has been submitted to the chain
  - `pending` A key purchase transaction is in the mempool
  - `confirming` A key purchase transaction has been mined, and is awaiting required confirmations
  - `valid` The key has been purchased, transaction confirmed, and has not expired
  - `expired` The key has been purchased, transaction confirmed, and is now expired
- `transactions` An array of all key purchase transactions by this owner on the lock. This is sorted by block number, with
  pending and submitted transactions first (pending transactions are assigned a block number that is the highest number javascript
  can represent, and show up first)

The `status` and `transactions` fields are calculated in `keyStatus.js` with the `linkTransactionsToKeys` function.

## Key purchase

Key purchasing is handled in `keyPurchase.js` and by `processKeyPurchaseTransactions`. When an update to transactions occurs,
the `onUpdateTransaction` listener is called, with both modified transactions and modified keys. This is due to the `status`
and `transactions` fields in a key, which are directly affected by the most recent transaction.

