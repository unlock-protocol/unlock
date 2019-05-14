import * as cache from './cache'

let currentNetwork
let currentAccount

export function setup(networkId, account) {
  currentNetwork = networkId
  currentAccount = account
}

export async function getKeys(window) {
  return await cache.get(window, currentNetwork, currentAccount, 'keys')
}

export async function getLocks(window) {
  return await cache.get(window, currentNetwork, currentAccount, 'locks')
}

export async function getTransactions(window) {
  return await cache.get(window, currentNetwork, currentAccount, 'transactions')
}

export async function addKey(window, key) {
  const keys =
    (await cache.get(window, currentNetwork, currentAccount, 'keys')) || {}

  keys[key.id] = key
  await cache.put(window, currentNetwork, currentAccount, 'keys', keys)
}

export async function addLock(window, lock) {
  const locks =
    (await cache.get(window, currentNetwork, currentAccount, 'locks')) || {}

  locks[lock.address] = lock
  await cache.put(window, currentNetwork, currentAccount, 'locks', locks)
}

export async function addTransaction(window, transaction) {
  const transactions =
    (await cache.get(window, currentNetwork, currentAccount, 'transactions')) ||
    {}

  transactions[transaction.hash] = transaction
  await cache.put(
    window,
    currentNetwork,
    currentAccount,
    'transactions',
    transactions
  )
}
