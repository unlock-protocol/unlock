import * as cache from './cache'

let currentNetwork
let currentAccount

export function setup(networkId, account) {
  currentNetwork = networkId
  currentAccount = account
}

async function _get(window, key) {
  return await cache.get({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
    type: key,
  })
}

export async function getKeys(window) {
  return await _get(window, 'keys')
}

export async function getLocks(window) {
  return await _get(window, 'locks')
}

export async function getTransactions(window) {
  return await _get(window, 'transactions')
}

export async function addKey(window, key) {
  const keys = (await getKeys(window)) || {}

  keys[key.id] = key
  await cache.put({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
    type: 'keys',
    value: keys,
  })
}

export async function addLock(window, lock) {
  const locks = (await getLocks(window)) || {}

  locks[lock.address] = lock
  await cache.put({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
    type: 'locks',
    value: locks,
  })
}

export async function addTransaction(window, transaction) {
  const transactions = (await getTransactions(window)) || {}

  transactions[transaction.hash] = transaction
  await cache.put({
    window,
    networkId: currentNetwork,
    accountAddress: currentAccount,
    type: 'transactions',
    value: transactions,
  })
}
