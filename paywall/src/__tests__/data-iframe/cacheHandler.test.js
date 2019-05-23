import {
  setup,
  setKeys,
  setLocks,
  setTransactions,
  getKeys,
  getLocks,
  getTransactions,
  setAccount,
  setNetwork,
  getFormattedCacheValues,
  setAccountBalance,
} from '../../data-iframe/cacheHandler'
import { storageId } from '../../data-iframe/cache'
import { TRANSACTION_TYPES } from '../../constants'

describe('cacheHandler', () => {
  let fakeWindow
  const id = storageId('network', 'account')
  const nonAccountSpecificId = storageId(
    'network',
    '0x0000000000000000000000000000000000000000'
  )
  const myKeys = {
    lock: {
      id: 'myKey',
      owner: 'owner',
      lock: 'lock',
      expirationTimestamp: 0,
    },
  }
  const myLocks = {
    myLock: {
      address: 'myLock',
      keyPrice: '1',
    },
  }
  const myTransactions = {
    myTransaction: {
      hash: 'myTransaction',
      lock: 'lock',
    },
  }

  beforeEach(() => {
    setup('network', 'account')
    fakeWindow = {
      storage: {},
      localStorage: {
        setItem(key, item) {
          fakeWindow.storage[key] = item
        },
        getItem(key) {
          return fakeWindow.storage[key]
        },
        removeItem(key) {
          delete fakeWindow.storage[key]
        },
      },
    }
  })

  describe('setting values', () => {
    it('setKeys', async () => {
      expect.assertions(1)

      await setKeys(fakeWindow, myKeys)

      expect(fakeWindow.storage).toEqual({
        [id]: JSON.stringify({
          keys: myKeys,
        }),
      })
    })

    it('setLocks', async () => {
      expect.assertions(1)

      await setLocks(fakeWindow, myLocks)

      expect(fakeWindow.storage).toEqual({
        [nonAccountSpecificId]: JSON.stringify({
          locks: myLocks,
        }),
      })
    })

    it('setTransactions', async () => {
      expect.assertions(1)

      await setTransactions(fakeWindow, myTransactions)

      expect(fakeWindow.storage).toEqual({
        [id]: JSON.stringify({
          transactions: myTransactions,
        }),
      })
    })

    it('setting multiple cache values', async () => {
      expect.assertions(1)

      await setKeys(fakeWindow, myKeys)
      await setLocks(fakeWindow, myLocks)
      await setTransactions(fakeWindow, myTransactions)

      expect(fakeWindow.storage).toEqual({
        [nonAccountSpecificId]: JSON.stringify({
          locks: myLocks,
        }),
        [id]: JSON.stringify({
          keys: myKeys,
          transactions: myTransactions,
        }),
      })
    })
  })

  describe('getting values', () => {
    beforeEach(async () => {
      fakeWindow = {
        storage: {},
        localStorage: {
          setItem(key, item) {
            fakeWindow.storage[key] = item
          },
          getItem(key) {
            return fakeWindow.storage[key]
          },
          removeItem(key) {
            delete fakeWindow.storage[key]
          },
        },
      }

      await setAccount(fakeWindow, 'account')
      await setNetwork(fakeWindow, 'network')
      await setKeys(fakeWindow, myKeys)
      await setLocks(fakeWindow, myLocks)
      await setTransactions(fakeWindow, myTransactions)
    })

    it('getKeys', async () => {
      expect.assertions(1)

      const keys = await getKeys(fakeWindow)

      expect(keys).toEqual(myKeys)
    })

    it('getLocks', async () => {
      expect.assertions(1)

      const locks = await getLocks(fakeWindow)

      expect(locks).toEqual(myLocks)
    })

    it('getTransactions', async () => {
      expect.assertions(1)

      const transactions = await getTransactions(fakeWindow)

      expect(transactions).toEqual(myTransactions)
    })
  })

  describe('getFormattedCacheValues', () => {
    const keys = {
      lock1: {
        id: 'lock1-account',
        owner: 'account',
        lock: 'lock1',
        expiration: new Date().getTime() / 1000 + 1000,
      },
      lock2: {
        id: 'lock2-account',
        owner: 'account',
        lock: 'lock2',
        expiration: 0,
      },
      lock3: {
        id: 'lock3-account',
        owner: 'account',
        lock: 'lock3',
        expiration: new Date().getTime() / 1000 - 1000,
      },
    }
    const locks = {
      lock1: {
        address: 'lock1',
        keyPrice: '1',
        expirationDuration: 5,
      },
      lock2: {
        address: 'lock2',
        keyPrice: '2',
        expirationDuration: 6,
      },
      lock3: {
        address: 'lock3',
        keyPrice: '3',
        expirationDuration: 7,
      },
    }
    const transactions = {
      hash1: {
        hash: 'hash1',
        lock: 'lock1',
        key: 'lock1-account',
        to: 'lock1',
        from: 'account',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        blockNumber: 1,
        status: 'mined',
        confirmations: 2,
      },
      hash2: {
        hash: 'hash2',
        lock: 'lock3',
        key: 'lock3-account',
        to: 'lock3',
        from: 'account',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        blockNumber: 2,
        status: 'mined',
        confirmations: 12345,
      },
    }

    beforeEach(async () => {
      fakeWindow = {
        storage: {},
        localStorage: {
          setItem(key, item) {
            fakeWindow.storage[key] = item
          },
          getItem(key) {
            return fakeWindow.storage[key]
          },
          removeItem(key) {
            delete fakeWindow.storage[key]
          },
        },
      }

      await setNetwork(fakeWindow, 3)
      await setAccount(fakeWindow, 'account')
      await setAccountBalance(fakeWindow, '2')
      await setKeys(fakeWindow, keys)
      await setLocks(fakeWindow, locks)
      await setTransactions(fakeWindow, transactions)
    })

    it('returns properly formatted values', async () => {
      expect.assertions(1)

      const values = await getFormattedCacheValues(fakeWindow, 5)

      expect(values).toEqual({
        account: 'account',
        balance: '2',
        networkId: 3,
        locks: {
          lock1: {
            ...locks.lock1,
            key: {
              ...keys.lock1,
              confirmations: 2,
              status: 'confirming',
              transactions: [transactions.hash1],
            },
          },
          lock2: {
            ...locks.lock2,
            key: {
              ...keys.lock2,
              confirmations: 0,
              status: 'none',
              transactions: [],
            },
          },
          lock3: {
            ...locks.lock3,
            key: {
              ...keys.lock3,
              confirmations: 12345,
              status: 'expired',
              transactions: [transactions.hash2],
            },
          },
        },
      })
    })

    it('returns properly formatted values for no user account', async () => {
      expect.assertions(1)

      await setAccount(fakeWindow, null)
      const nullAccount = '0x0000000000000000000000000000000000000000'
      const fakeKey = {
        id: `-${nullAccount}`,
        owner: nullAccount,
        lock: 'lock',
        expiration: 0,
        status: 'none',
        confirmations: 0,
        transactions: [],
      }

      const values = await getFormattedCacheValues(fakeWindow, 5)

      expect(values).toEqual({
        account: null,
        balance: '0',
        networkId: 3,
        locks: {
          lock1: {
            ...locks.lock1,
            key: {
              ...fakeKey,
              lock: 'lock1',
              id: 'lock1' + fakeKey.id,
            },
          },
          lock2: {
            ...locks.lock2,
            key: {
              ...fakeKey,
              lock: 'lock2',
              id: 'lock2' + fakeKey.id,
            },
          },
          lock3: {
            ...locks.lock3,
            key: {
              ...fakeKey,
              lock: 'lock3',
              id: 'lock3' + fakeKey.id,
            },
          },
        },
      })
    })
  })
})
