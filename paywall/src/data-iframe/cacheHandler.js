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

export async function getKeys(window) {
  const lockAddresses = await getLockAddresses(window)

  const keys = await Promise.all(
    lockAddresses.map(address => getKey(window, address))
  )

  return keys.reduce(
    (allKeys, key) => ({
      ...allKeys,
      [key.lock]: key,
    }),
    {}
  )
}

export async function getLockAddresses(window) {
  return _get(window, 'lockAddresses')
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
  const hashes = await getTransactionHashes(window)
  if (!hashes.length) return {}

  const transactions = await Promise.all(
    hashes.map(hash => getTransaction(window, hash))
  )
  return transactions.reduce(
    (allTransactions, transaction) => ({
      ...allTransactions,
      [transaction.hash]: transaction,
    }),
    {}
  )
}

export async function setAccount(window, account) {
  // intercept the account setting so we have it available as well for retrieving user-specific cache
  currentAccount = account
  return cache.setAccount(window, account)
}

export async function setNetwork(window, network) {
  // intercept the network setting so we have it available as well for retrieving user-specific cache
  currentNetwork = network
  return cache.setNetwork(window, network)
}

export async function getTransactionHashes(window) {
  return (await _get(window, 'transactionHashes')) || []
}

export async function getAccountBalance(window) {
  return _get(window, 'balance')
}

export async function setAccountBalance(window, balance) {
  return _put(window, 'balance', balance)
}

export async function setKeys(window, keys) {
  return Promise.all(Object.values(keys).map(key => setKey(window, key)))
}

export async function setLockAddresses(window, addresses) {
  return _put(window, 'lockAddresses', addresses)
}

export async function setKey(window, key) {
  return _put(window, `key/${key.lock}`, key)
}

export async function setLock(window, key) {
  return _put(window, `lock/${key.lock}`, key)
}

export async function getKey(window, lockAddress) {
  return _get(window, `key/${lockAddress}`)
}

export async function getLock(window, lockAddress) {
  return _get(window, `lock/${lockAddress}`)
}

export async function setTransaction(window, transaction) {
  const hashes = await getTransactionHashes(window)
  if (!hashes.includes(transaction.hash)) {
    hashes.push(transaction.hash)
    await _put(window, 'transactionHashes', hashes)
  }
  return _put(window, `transaction/${transaction.hash}`, transaction)
}

export async function getTransaction(window, transaction) {
  return _get(window, `transaction/${transaction.hash}`)
}

/**
 * Locks are not user-dependent
 *
 * So we save in the non-account-specific cache
 */
export async function setLocks(window, locks) {
  await _put(window, 'lockAddresses', Object.keys(locks))
  return cache.put({
    window,
    networkId: currentNetwork,
    type: 'locks',
    value: locks,
  })
}

export async function setTransactions(window, transactions) {
  const transactionHashes = Object.keys(transactions)
  await _put(window, 'transactionHashes', transactionHashes)
  return Promise.all(
    transactionHashes.map(hash => setTransaction(window, transactions[hash]))
  )
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
