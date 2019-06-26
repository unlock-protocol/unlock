import {
  setLocks,
  setKey,
  setTransaction,
  setAccount,
  setAccountBalance,
  setNetwork,
  setTransactions,
  setKeys,
} from '../cacheHandler'

/**
 * This listens for changes from the blockchain handler, and stores them in the cache
 *
 * Possible updates are defined by the `methods` variable.
 *
 * Two updates, `walletModal` and `error` are not stored in the cache, but instead are
 * directly relayed to the main window via the `onChange` handler in `makeSetConfig`
 * @param {object} updates updates from the blockchain
 */
export default async function syncToCache(window, updates) {
  const methods = {
    locks: setLocks,
    key: setKey,
    keys: setKeys,
    transaction: setTransaction,
    transactions: setTransactions,
    account: setAccount,
    balance: setAccountBalance,
    network: setNetwork,
  }

  const updateKeys = Object.keys(updates)
  for (let i = 0; i < updateKeys.length; i++) {
    const updateType = updateKeys[i]
    const update = updates[updateType]
    if (!methods[updateType]) {
      throw new Error(`internal error, no cache handler for "${updateType}"`)
    }
    await methods[updateType](window, update)
  }
}
