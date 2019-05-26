import * as cache from './cache'
import linkKeysToLocks from './blockchainHandler/linkKeysToLocks'

let currentNetwork
let currentAccount

export const getAccount = cache.getAccount
export const getNetwork = cache.getNetwork

export function setup(networkId, account) {
  currentNetwork = networkId
  currentAccount = account
}

async function _get(window, key) {
  return cache.get({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
    type: key,
  })
}

async function _put(window, key, value) {
  return cache.put({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
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
    (await cache.get({ window, networkId: currentNetwork, type: 'locks' })) ||
    {}
  return locks
}

export async function getTransactions(window) {
  const transactions = (await _get(window, 'transactions')) || {}
  return transactions
}

export async function setAccount(window, account) {
  // intercept the account setting so we have it available as well for retrieving user-specific cache
  currentAccount = account
  await cache.setAccount(window, account)
  notifyListeners('account')
  return
}

export async function setNetwork(window, network) {
  // intercept the network setting so we have it available as well for retrieving user-specific cache
  currentNetwork = network
  await cache.setNetwork(window, network)
  notifyListeners('network')
  return
}

export async function getAccountBalance(window) {
  return _get(window, 'balance')
}

export async function setAccountBalance(window, balance) {
  await _put(window, 'balance', balance)
  notifyListeners('balance')
  return
}

export async function setKeys(window, keys) {
  await _put(window, 'keys', keys)
  notifyListeners('keys')
  return
}

/**
 * Save a single key without overwriting the other keys with potentially stale data
 */
export async function setKey(window, key) {
  await _merge(window, 'keys', key.lock, key)
  notifyListeners('keys')
  return
}

/**
 * Locks are not user-dependent
 *
 * So we save in the non-account-specific cache
 */
export async function setLocks(window, locks) {
  await cache.put({
    window,
    networkId: currentNetwork,
    type: 'locks',
    value: locks,
  })
  notifyListeners('locks')
  return
}

export async function setTransactions(window, transactions) {
  await _put(window, 'transactions', transactions)
  notifyListeners('transactions')
  return
}

/**
 * Save a single transaction without overwriting the other transactions with potentially stale data
 */
export async function setTransaction(window, transaction) {
  await _merge(window, 'transactions', transaction.hash, transaction)
  notifyListeners('transactions')
  return
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

export async function notifyListeners(type) {
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
