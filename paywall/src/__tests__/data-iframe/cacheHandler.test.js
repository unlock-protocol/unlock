import {
  setup,
  addKey,
  addLock,
  addTransaction,
  getKeys,
  getLocks,
  getTransactions,
} from '../../data-iframe/cacheHandler'
import { storageId } from '../../data-iframe/cache'

describe('cacheHandler', () => {
  let fakeWindow
  const id = storageId('network', 'account')
  const myKey = {
    id: 'myKey',
    owner: 'owner',
    lock: 'lock',
    expirationTimestamp: 0,
  }
  const myLock = {
    address: 'myLock',
    keyPrice: '1',
  }
  const myTransaction = {
    hash: 'myTransaction',
    lock: 'lock',
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
    it('addKey', async () => {
      expect.assertions(1)

      await addKey(fakeWindow, myKey)

      expect(fakeWindow.storage).toEqual({
        [id]: JSON.stringify({
          keys: {
            myKey,
          },
        }),
      })
    })

    it('addLock', async () => {
      expect.assertions(1)

      await addLock(fakeWindow, myLock)

      expect(fakeWindow.storage).toEqual({
        [id]: JSON.stringify({
          locks: {
            myLock,
          },
        }),
      })
    })

    it('addTransaction', async () => {
      expect.assertions(1)

      await addTransaction(fakeWindow, myTransaction)

      expect(fakeWindow.storage).toEqual({
        [id]: JSON.stringify({
          transactions: {
            myTransaction,
          },
        }),
      })
    })

    it('setting multiple cache values', async () => {
      expect.assertions(1)

      await addKey(fakeWindow, myKey)
      await addLock(fakeWindow, myLock)
      await addTransaction(fakeWindow, myTransaction)

      expect(fakeWindow.storage).toEqual({
        [id]: JSON.stringify({
          keys: {
            myKey,
          },
          locks: {
            myLock,
          },
          transactions: {
            myTransaction,
          },
        }),
      })
    })
  })
  describe('getting values', () => {
    beforeEach(async () => {
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

      await addKey(fakeWindow, myKey)
      await addLock(fakeWindow, myLock)
      await addTransaction(fakeWindow, myTransaction)
    })

    it('getKeys', async () => {
      expect.assertions(1)

      const keys = await getKeys(fakeWindow)

      expect(keys).toEqual({ myKey })
    })

    it('getLocks', async () => {
      expect.assertions(1)

      const locks = await getLocks(fakeWindow)

      expect(locks).toEqual({ myLock })
    })

    it('getTransactions', async () => {
      expect.assertions(1)

      const transactions = await getTransactions(fakeWindow)

      expect(transactions).toEqual({ myTransaction })
    })
  })
})
