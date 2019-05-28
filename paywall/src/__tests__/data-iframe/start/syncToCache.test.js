import syncToCache from '../../../data-iframe/start/syncToCache'
import {
  getLocks,
  getKeys,
  getTransactions,
  setKeys,
  setTransactions,
  getAccount,
  getAccountBalance,
  getNetwork,
} from '../../../data-iframe/cacheHandler'

describe('syncToCache', () => {
  let fakeWindow

  beforeEach(() => {
    fakeWindow = {
      storage: {},
      localStorage: {
        getItem: jest.fn(key => fakeWindow.storage[key]),
        setItem: jest.fn((key, value) => {
          if (typeof value !== 'string') {
            throw new Error('localStorage only supports strings')
          }
          fakeWindow.storage[key] = value
        }),
        removeItem: jest.fn(key => {
          delete fakeWindow.storage[key]
        }),
      },
    }
  })

  it('throws for unknown key', async () => {
    expect.assertions(1)

    try {
      await syncToCache(fakeWindow, { whatever: 1 })
    } catch (e) {
      expect(e.message).toBe('internal error, no cache handler for "whatever"')
    }
  })

  it('syncs locks to cache', async () => {
    expect.assertions(1)

    const locks = {
      lock: {
        address: 'lock',
      },
    }
    await syncToCache(fakeWindow, { locks })

    expect(await getLocks(fakeWindow)).toEqual(locks)
  })

  it('syncs keys to cache', async () => {
    expect.assertions(1)

    const keys = {
      lock: {
        lock: 'lock',
      },
    }
    await syncToCache(fakeWindow, { keys })

    expect(await getKeys(fakeWindow)).toEqual(keys)
  })

  it('syncs transactions to cache', async () => {
    expect.assertions(1)

    const transactions = {
      hash: {
        hash: 'hash',
      },
    }
    await syncToCache(fakeWindow, { transactions })

    expect(await getTransactions(fakeWindow)).toEqual(transactions)
  })

  it('syncs a single key to the cache', async () => {
    expect.assertions(1)

    const key = {
      lock: 'lock2',
    }
    const startKeys = {
      lock: {
        lock: 'lock',
      },
    }
    const keys = {
      ...startKeys,
      lock2: key,
    }
    await setKeys(fakeWindow, startKeys)
    await syncToCache(fakeWindow, { key })

    expect(await getKeys(fakeWindow)).toEqual(keys)
  })

  it('syncs a single transaction to the cache', async () => {
    expect.assertions(1)

    const transaction = {
      hash: 'hash2',
    }
    const startTransactions = {
      hash: {
        hash: 'hash',
      },
    }
    const transactions = {
      ...startTransactions,
      hash2: transaction,
    }
    await setTransactions(fakeWindow, startTransactions)
    await syncToCache(fakeWindow, { transaction })

    expect(await getTransactions(fakeWindow)).toEqual(transactions)
  })

  it('syncs account to the cache', async () => {
    expect.assertions(1)

    const account = 'account'
    await syncToCache(fakeWindow, { account })

    expect(await getAccount(fakeWindow)).toEqual(account)
  })

  it('syncs account balance to the cache', async () => {
    expect.assertions(1)

    const balance = '1'
    await syncToCache(fakeWindow, { balance })

    expect(await getAccountBalance(fakeWindow)).toEqual(balance)
  })

  it('syncs network to the cache', async () => {
    expect.assertions(1)

    const network = 1
    await syncToCache(fakeWindow, { network })

    expect(await getNetwork(fakeWindow)).toEqual(network)
  })

  it('syncs multiple keys to the cache at once', async () => {
    expect.assertions(2)

    const account = 'account'
    const balance = '1'
    await syncToCache(fakeWindow, { account, balance })

    expect(await getAccount(fakeWindow)).toEqual(account)
    expect(await getAccountBalance(fakeWindow)).toEqual(balance)
  })
})
