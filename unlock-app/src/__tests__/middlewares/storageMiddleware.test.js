import storageMiddleware from '../../middlewares/storageMiddleware'
import { UPDATE_LOCK, updateLock } from '../../actions/lock'
import { STORE_LOCK_NAME } from '../../actions/storage'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT } from '../../actions/accounts'

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */

let state
let account
let lock
let network

const create = () => {
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()
  const handler = storageMiddleware(store)
  const invoke = action => handler(next)(action)
  return { next, invoke, store }
}

let mockStorageService = {}

jest.mock('../../services/storageService', () => {
  return function() {
    return mockStorageService
  }
})

describe('Storage middleware', () => {
  beforeEach(() => {
    account = {
      address: '0xabc',
    }
    network = {
      name: 'test',
    }
    lock = {
      address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      keyPrice: '100',
      owner: account.address,
    }
    state = {
      account,
      network,
      provider: 'HTTP',
      locks: {
        [lock.address]: lock,
      },
      keys: {},
    }
    // reset the mock
    mockStorageService = {}
  })

  describe('handling NEW_TRANSACTION', () => {
    it('should store the transaction', async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const transaction = {
        hash: '0x123',
        to: 'unlock',
        from: 'julien',
      }
      const action = { type: NEW_TRANSACTION, transaction }

      mockStorageService.storeTransaction = jest.fn(() => {
        return Promise.resolve()
      })
      await invoke(action)
      expect(mockStorageService.storeTransaction).toHaveBeenCalledWith(
        transaction.hash,
        transaction.from,
        transaction.to
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling SET_ACCOUNT', () => {
    it('should store the transaction', async () => {
      expect.assertions(5)
      const { next, invoke, store } = create()
      const account = {
        address: '0x123',
      }
      const action = { type: SET_ACCOUNT, account }

      mockStorageService.getTransactionsHashesSentBy = jest.fn(() => {
        return Promise.resolve(['0xabc', '0xdef'])
      })
      await invoke(action)
      expect(
        mockStorageService.getTransactionsHashesSentBy
      ).toHaveBeenCalledWith(account.address)
      expect(
        mockStorageService.getTransactionsHashesSentBy
      ).toHaveBeenCalledWith(account.address)

      expect(store.dispatch).toHaveBeenNthCalledWith(
        1,
        addTransaction({
          hash: '0xabc',
        })
      )

      expect(store.dispatch).toHaveBeenNthCalledWith(
        2,
        addTransaction({
          hash: '0xdef',
        })
      )

      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling STORE_LOCK_NAME', () => {
    it("dispatches to the appropriate storage middleware handler to store the lock's name", async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: STORE_LOCK_NAME }
      mockStorageService.storeLockDetails = jest.fn(() => {
        return Promise.resolve()
      })
      await invoke(action)
      expect(mockStorageService.storeLockDetails).toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling UPDATE_LOCK', () => {
    describe('when the update is for a lock which already has a name', () => {
      it('calls the next middleware', async () => {
        expect.assertions(2)
        const { next, invoke } = create()
        const action = { type: UPDATE_LOCK, address: lock.address, update: {} }
        state.locks[lock.address].name = 'My lock'
        mockStorageService.lockLookUp = jest.fn(() => {})

        await invoke(action)
        expect(mockStorageService.lockLookUp).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the update is not a transaction', () => {
      it('dispatches to the appropriate storage middleware handler', async () => {
        expect.assertions(3)
        const { next, invoke, store } = create()
        const action = { type: UPDATE_LOCK, address: lock.address, update: {} }
        delete state.locks[lock.address].name
        mockStorageService.lockLookUp = jest.fn(() => {
          return Promise.resolve('A lock has no name')
        })
        await invoke(action)
        expect(mockStorageService.lockLookUp).toHaveBeenCalledWith(lock.address)
        expect(next).toHaveBeenCalledTimes(1)
        expect(store.dispatch).toHaveBeenCalledWith(
          updateLock(lock.address, { name: 'A lock has no name' })
        )
      })
    })
  })
})
