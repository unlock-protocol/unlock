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
  setKey,
  clearListeners,
  addListener,
  removeListener,
  setTransaction,
} from '../../data-iframe/cacheHandler'
import { TRANSACTION_TYPES } from '../../constants'

describe('cacheHandler', () => {
  let fakeWindow
  const myKeys = {
    lock: {
      id: 'myKey',
      owner: 'account',
      lock: 'lock',
      expirationTimestamp: 0,
    },
    lock2: {
      id: 'myKey',
      owner: 'account',
      lock: 'lock2',
      expirationTimestamp: 0,
    },
  }
  const myLocks = {
    lock: {
      address: 'lock',
      keyPrice: '1',
    },
    lock2: {
      address: 'lock2',
      keyPrice: '12',
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
    it('setLockAddresses', async () => {
      expect.assertions(1)

      await setLockAddresses(fakeWindow, ['0x123', '0x456'])

      expect(await getLockAddresses(fakeWindow)).toEqual(['0x123', '0x456'])
    })

    it('setKey', async () => {
      expect.assertions(1)

      await setKey(fakeWindow, {
        owner: 'my key',
        lock: 'lock',
      })

      expect(await getKey(fakeWindow, 'lock')).toEqual({
        owner: 'my key',
        lock: 'lock',
      })
    })

    it('setKeys', async () => {
      expect.assertions(1)

      await setLockAddresses(fakeWindow, Object.keys(myKeys))
      await setKeys(fakeWindow, myKeys)

      expect(await getKeys(fakeWindow)).toEqual(myKeys)
    })

    describe('setKey', () => {
      it('sets a new key without disturbing existing keys', async () => {
        expect.assertions(1)

        await setKeys(fakeWindow, myKeys)
        await setKey(fakeWindow, {
          lock: 'lock2',
        })

        expect(await getKeys(fakeWindow)).toEqual({
          ...myKeys,
          lock2: { lock: 'lock2' },
        })
      })

      it('overwrites an existing key', async () => {
        expect.assertions(1)

        await setKeys(fakeWindow, myKeys)
        await setKey(fakeWindow, {
          lock: 'lock',
          new: 'guy',
        })

        expect(await getKeys(fakeWindow)).toEqual({
          lock: { lock: 'lock', new: 'guy' },
        })
      })
    })

    it('setLocks', async () => {
      expect.assertions(1)

      await setLocks(fakeWindow, myLocks)

      expect(await getLocks(fakeWindow)).toEqual(myLocks)
    })

    it('setTransactions', async () => {
      expect.assertions(1)

      await setTransactions(fakeWindow, myTransactions)

      expect(await getTransactions(fakeWindow)).toEqual(myTransactions)
    })

    describe('setTransaction', () => {
      it('sets a new transaction without disturbing existing transactions', async () => {
        expect.assertions(1)

        await setTransactions(fakeWindow, myTransactions)
        await setTransaction(fakeWindow, {
          hash: 'hash2',
        })

        expect(await getTransactions(fakeWindow)).toEqual({
          ...myTransactions,
          hash2: { hash: 'hash2' },
        })
      })

      it('overwrites an existing transaction', async () => {
        expect.assertions(1)

        await setTransactions(fakeWindow, myTransactions)
        await setTransaction(fakeWindow, {
          hash: 'myTransaction',
          new: 'guy',
        })

        expect(await getTransactions(fakeWindow)).toEqual({
          myTransaction: { hash: 'myTransaction', new: 'guy' },
        })
      })
    })

    it('setting multiple cache values', async () => {
      expect.assertions(3)

      await setAccount(fakeWindow, 'account')
      await setKeys(fakeWindow, myKeys)
      await setLocks(fakeWindow, myLocks)
      await setTransactions(fakeWindow, myTransactions)

      expect(await getKeys(fakeWindow)).toEqual(myKeys)
      expect(await getLocks(fakeWindow)).toEqual(myLocks)
      expect(await getTransactions(fakeWindow)).toEqual(myTransactions)
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
      await setNetwork(fakeWindow, 2)
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

    describe('values not set', () => {
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
      })

      it('getLocks', async () => {
        expect.assertions(1)

        const locks = await getLocks(fakeWindow)

        expect(locks).toEqual({})
      })

      it('getLockAddresses', async () => {
        expect.assertions(1)

        const locks = await getLockAddresses(fakeWindow)

        expect(locks).toEqual([])
      })

      it('getTransactionHashes', async () => {
        expect.assertions(1)

        const hashes = await getTransactionHashes(fakeWindow)

        expect(hashes).toEqual([])
      })

      it('getTransactions', async () => {
        expect.assertions(1)

        const transactions = await getTransactions(fakeWindow)

        expect(transactions).toEqual({})
      })
    })
  })

  describe('user account changes', () => {
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
      await setNetwork(fakeWindow, 2)
      await setKeys(fakeWindow, myKeys)
      await setLocks(fakeWindow, myLocks)
      await setTransactions(fakeWindow, myTransactions)

      await setAccount(fakeWindow, 'different')
    })

    it('should still return cached locks', async () => {
      expect.assertions(1)

      expect(await getLocks(fakeWindow)).toEqual(myLocks)
    })

    it('should not return cached keys', async () => {
      expect.assertions(1)

      expect(await getKeys(fakeWindow)).toEqual({})
    })

    it('should not return cached transactions', async () => {
      expect.assertions(1)

      expect(await getTransactions(fakeWindow)).toEqual({})
    })

    it('setting a new cache value does not interfere with other accounts', async () => {
      expect.assertions(2)

      const differentKeys = {
        lock2: {
          lock: 'lock2',
          owner: 'different',
        },
      }

      await setKeys(fakeWindow, differentKeys)
      expect(await getKeys(fakeWindow)).toEqual(differentKeys)

      await setAccount(fakeWindow, 'account')
      expect(await getKeys(fakeWindow)).toEqual(myKeys)
    })
  })

  describe('network changes', () => {
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
      await setNetwork(fakeWindow, 2)
      await setKeys(fakeWindow, myKeys)
      await setLocks(fakeWindow, myLocks)
      await setTransactions(fakeWindow, myTransactions)

      await setNetwork(fakeWindow, 4)
    })

    it('cached locks from a different network do not return', async () => {
      expect.assertions(1)

      expect(await getLocks(fakeWindow)).toEqual({})
    })

    it('should not return cached keys', async () => {
      expect.assertions(1)

      expect(await getKeys(fakeWindow)).toEqual({})
    })

    it('should not return cached transactions', async () => {
      expect.assertions(1)

      expect(await getTransactions(fakeWindow)).toEqual({})
    })

    it('setting a new cache value does not interfere with other networks', async () => {
      expect.assertions(2)

      const differentKeys = {
        lock2: {
          lock: 'lock2',
          owner: 'different',
        },
      }

      await setKeys(fakeWindow, differentKeys)
      expect(await getKeys(fakeWindow)).toEqual(differentKeys)

      await setNetwork(fakeWindow, 2)
      expect(await getKeys(fakeWindow)).toEqual(myKeys)
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

  describe('notifications', () => {
    const fakeWindow = {
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
    describe('addListener and removeListener', () => {
      beforeEach(() => {
        fakeWindow.storage = {}
        clearListeners()
      })

      it('notifies all listeners', async () => {
        expect.assertions(2)

        const listener1 = jest.fn()
        const listener2 = jest.fn()

        addListener(listener1)
        addListener(listener2)

        await setAccount(fakeWindow, 'hi')

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
      })

      it('adds and removes listeners', async () => {
        expect.assertions(4)

        const listener1 = jest.fn()
        const listener2 = jest.fn()

        addListener(listener1)
        addListener(listener2)

        await setAccount(fakeWindow, 'hi')

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)

        listener1.mockReset()
        listener2.mockReset()
        removeListener(listener1)

        await setAccount(fakeWindow, 'hi')

        expect(listener1).not.toHaveBeenCalled()
        expect(listener2).toHaveBeenCalledTimes(1)
      })
    })

    describe('notifying on cache change events', () => {
      describe('locks, keys, transactions', () => {
        const keys = {
          lock: { lock: 'lock' },
          lock2: { lock: 'lock2' },
        }
        const locks = {
          lock: { address: 'lock' },
          lock2: { address: 'lock2' },
        }

        const transactions = {
          hash: {
            hash: 'hash',
            lock: 'lock',
            key: 'lock-account',
          },
        }

        beforeEach(() => {
          fakeWindow.storage = {}
          clearListeners()
        })

        it('sends locks when calling setLocks', async () => {
          expect.assertions(1)

          await setLockAddresses(fakeWindow, ['lock', 'lock2'])
          await setKeys(fakeWindow, keys)

          const listener = jest.fn()
          addListener(listener)

          await setLocks(fakeWindow, locks)

          expect(listener).toHaveBeenCalledWith('locks')
        })

        it('sends locks when calling setKeys', async () => {
          expect.assertions(1)

          await setLockAddresses(fakeWindow, ['lock', 'lock2'])
          await setLocks(fakeWindow, locks)

          const listener = jest.fn()
          addListener(listener)

          await setKeys(fakeWindow, keys)

          expect(listener).toHaveBeenCalledWith('locks')
        })

        it('sends locks when calling setKey', async () => {
          expect.assertions(1)

          await setLockAddresses(fakeWindow, ['lock', 'lock2'])
          await setLocks(fakeWindow, locks)
          await setKeys(fakeWindow, keys)

          const listener = jest.fn()
          addListener(listener)

          const newKey = { lock: 'lock', expiration: 5 }
          await setKey(fakeWindow, newKey)

          expect(listener).toHaveBeenCalledWith('locks')
        })

        it('sends locks when calling setTransactions', async () => {
          expect.assertions(1)

          await setLockAddresses(fakeWindow, ['lock', 'lock2'])
          await setLocks(fakeWindow, locks)
          await setKeys(fakeWindow, keys)

          const listener = jest.fn()
          addListener(listener)

          await setTransactions(fakeWindow, transactions)

          expect(listener).toHaveBeenCalledWith('locks')
        })

        it('sends locks when calling setTransaction', async () => {
          expect.assertions(1)

          await setLockAddresses(fakeWindow, ['lock', 'lock2'])
          await setLocks(fakeWindow, locks)
          await setKeys(fakeWindow, keys)
          await setTransactions(fakeWindow, transactions)

          const listener = jest.fn()
          addListener(listener)

          const newTransaction = {
            hash: 'hash2',
            lock: 'lock',
            key: 'lock-account',
          }
          await setTransaction(fakeWindow, newTransaction)

          expect(listener).toHaveBeenCalledWith('locks')
        })
      })

      describe('account', () => {
        beforeEach(() => {
          fakeWindow.storage = {}
          clearListeners()
        })

        it('sends account when it is modified', async () => {
          expect.assertions(1)

          const listener = jest.fn()
          addListener(listener)

          await setAccount(fakeWindow, 'account')

          expect(listener).toHaveBeenCalledWith('account')
        })

        it('sends balance when balance is modified', async () => {
          expect.assertions(1)

          await setAccount(fakeWindow, 'account')

          const listener = jest.fn()
          addListener(listener)
          await setAccountBalance(fakeWindow, '12')

          expect(listener).toHaveBeenCalledWith('balance')
        })
      })

      describe('network', () => {
        beforeEach(() => {
          fakeWindow.storage = {}
          clearListeners()
        })

        it('sends network when it is modified', async () => {
          expect.assertions(1)

          const listener = jest.fn()
          addListener(listener)

          await setNetwork(fakeWindow, 2)

          expect(listener).toHaveBeenCalledWith('network')
        })
      })
    })
  })
})
