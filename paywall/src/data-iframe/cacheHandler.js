import * as cache from './cache'
import linkKeysToLocks from './blockchainHandler/linkKeysToLocks'

let currentNetwork
let currentAccount

const nullAccount = '0x0000000000000000000000000000000000000000'

export const getAccount = cache.getAccount
export const getNetwork = cache.getNetwork

export async function setAccount(window, account) {
  // intercept the account setting so we have it available as well for retrieving user-specific cache
  currentAccount = account
  await cache.setAccount(window, account)
  return notifyListeners(window, 'account')
}

export async function setNetwork(window, network) {
  // intercept the network setting so we have it available as well for retrieving user-specific cache
  currentNetwork = network
  await cache.setNetwork(window, network)
  return notifyListeners(window, 'network')
}

export async function getAccountBalance(window) {
  return _get(window, 'balance')
}

export async function setAccountBalance(window, balance) {
  await _put(window, 'balance', balance)
  return notifyListeners(window, 'balance')
}

export function setup(networkId, account) {
  currentNetwork = networkId
  currentAccount = account
}

/**
 * @param {window} window the global context (window, self, global)
 * @param {string} key the name of the item to access
 * @param {bool} nonAccountSpecific if true, then the value will return even if the
 *                                  user changes their active account. It does not persist
 *                                  across network changes
 */
async function _get(window, key, nonAccountSpecific = false) {
  return cache.get({
    window,
    networkId: currentNetwork,
    accountAddress: nonAccountSpecific ? nullAccount : currentAccount,
    type: key,
  })
}

/**
 * @param {window} window the global context (window, self, global)
 * @param {string} key the name of the item to access
 * @param {*} value a JSON serializable value to store
 * @param {bool} nonAccountSpecific if true, then the value will return even if the
 *                                  user changes their active account. It does not persist
 *                                  across network changes
 */
async function _put(window, key, value, nonAccountSpecific = false) {
  return cache.put({
    window,
    networkId: currentNetwork,
    accountAddress: nonAccountSpecific ? nullAccount : currentAccount,
    type: key,
    value,
  })
}

async function _merge(window, key, subType, value) {
  return cache.merge({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
    type: key,
    subType,
    value,
  })
}

export async function getKeys(window) {
  return (await _get(window, 'keys')) || {}
}

/**
 * Locks are not user-dependent
 *
 * So we retrieve from the non-account-specific cache
 */
export async function getLocks(window) {
  const locks =
    (await _get(window, 'locks', true /* non-account specific */)) || {}
  return locks
}

/**
 * Locks are not user-dependent
 *
 * So we save in the non-account-specific cache
 */
export async function setLocks(window, locks) {
  await setLockAddresses(window, Object.keys(locks))
  await _put(window, 'locks', locks, true /* non-account specific */)
  return notifyListeners(window, 'locks')
}

/**
 * Retrieve all of the cached keys for the active account and network
 *
 * Note that the list of lock addresse must have been saved first.
 */
export async function getKeys(window) {
  const lockAddresses = await getLockAddresses(window)

  const keys = (await Promise.all(
    lockAddresses.map(address => getKey(window, address))
  )).filter(key => key) // remove non-existing cache entries

  return keys.reduce(
    (allKeys, key) => ({
      ...allKeys,
      [key.lock]: key,
    }),
    {}
  )
}

/**
 * Cache the keys for the active account and network
 */
export async function setKeys(window, keys) {
  await Promise.all(Object.values(keys).map(key => setKey(window, key)))
  return notifyListeners(window, 'keys')
}

/**
 * Save a specific key in the cache for the current user in the current network
 */
export async function setKey(window, key) {
  await _put(window, `key/${key.lock}`, key)
  return notifyListeners(window, 'keys')
}

/**
 * Retrieve a specific key in the cache for the current user in the current network
 */
export async function getKey(window, lockAddress) {
  return _get(window, `key/${lockAddress}`)
}

/**
 * get the list of key purchase transaction hashes returned from locksmith for this user on this network
 */
export async function getTransactionHashes(window) {
  return (await _get(window, 'transactionHashes')) || []
}

/**
 * set the list of key purchase transaction hashes returned from locksmith for this user on this network
 */
export async function setTransactionHashes(window, hashes) {
  return _put(window, 'transactionHashes', hashes)
}

/**
 * Get the list of key purchase transactions as an object, indexed by transaction hash,
 * for the current user on the current network
 */
export async function getTransactions(window) {
  const hashes = await getTransactionHashes(window)
  if (!hashes.length) return {}

  const transactions = (await Promise.all(
    hashes.map(hash => getTransaction(window, hash))
  )).filter(transaction => transaction) // remove non-existing cache entries

  return transactions.reduce(
    (allTransactions, transaction) => ({
      ...allTransactions,
      [transaction.hash]: transaction,
    }),
    {}
  )
}

/**
 * Set the list of key purchase transactions, indexed by transaction hash, for the current user
 * on the current network
 */
export async function setTransactions(window, transactions) {
  const transactionHashes = Object.keys(transactions)
  await setTransactionHashes(window, transactionHashes)
  await Promise.all(
    transactionHashes.map(hash => setTransaction(window, transactions[hash]))
  )
  return notifyListeners(window, 'transactions')
}

/**
 * Save a single transaction for the current user on the current network
 *
 * Also updates the list of transaction hashes if it is a brand-new
 * key purchase transaction
 */
export async function setTransaction(window, transaction) {
  const hashes = await getTransactionHashes(window)
  if (!hashes.includes(transaction.hash)) {
    hashes.push(transaction.hash)
    await setTransactionHashes(window, hashes)
  }
  await _put(window, `transaction/${transaction.hash}`, transaction)
  return notifyListeners(window, 'transactions')
}

/**
 * Retrieve a specific key purchase transaction by hash for the current user on the current network
 */
export async function getTransaction(window, hash) {
  return _get(window, `transaction/${hash}`)
}

/**
 * Save a single transaction without overwriting the other transactions with potentially stale data
 */
export async function setTransaction(window, transaction) {
  return _merge(window, 'transactions', transaction.hash, transaction)
}

/**
 * Based on the current raw cache values, get the data the UI will need to
 * display information
 *
 * @param {window} window the current global context (window, self, global)
 * @param {number} requiredConfirmations the number of confirmations needed to consider a key valid
 * @returns {object} returns locks, account, balance, and networkId, all formatted for use in the UI
 */
export async function getFormattedCacheValues(window, requiredConfirmations) {
  const account = await getAccount(window)
  const balance = await getAccountBalance(window)
  const networkId = await getNetwork(window)
  if (!account) {
    const cachedLocks = await getLocks(window)
    const nullAccount = '0x0000000000000000000000000000000000000000'
    // construct the default keys for locks if there is no user
    const noKeys = Object.keys(cachedLocks).reduce(
      (keys, lockAddress) => ({
        ...keys,
        [lockAddress]: {
          id: `${lockAddress}-${nullAccount}`,
          owner: nullAccount,
          lock: lockAddress,
          expiration: 0,
          status: 'none',
          confirmations: 0,
          transactions: [],
        },
      }),
      {}
    )
    return {
      locks: await linkKeysToLocks({
        locks: cachedLocks,
        keys: noKeys,
        transactions: {},
        requiredConfirmations,
      }),
      account: null,
      balance: '0',
      networkId,
    }
  }
  setup(networkId, account)

  // grab all values from the cache
  const [cachedKeys, cachedLocks, cachedTransactions] = await Promise.all([
    getKeys(window),
    getLocks(window),
    getTransactions(window),
  ])
  return {
    locks: await linkKeysToLocks({
      locks: cachedLocks,
      keys: cachedKeys,
      transactions: cachedTransactions,
      requiredConfirmations,
    }),
    account,
    balance,
    networkId,
  }
}

let listeners = new Map()

export function addListener(listener) {
  if (listeners.has(listener)) return
  listeners.set(listener, listener)
}

export function removeListener(listener) {
  return listeners.delete(listener)
}

export function clearListeners() {
  listeners.clear()
}

export async function notifyListeners(window, type) {
  let value
  switch (type) {
    case 'locks':
    case 'keys':
    case 'transactions':
      value = 'locks'
      break
    case 'account':
    case 'balance':
    case 'network':
      value = type
      break
    default:
      throw new Error(`internal error, unknown type ${type}`)
  }

  listeners.forEach(listener => listener(value))
}
