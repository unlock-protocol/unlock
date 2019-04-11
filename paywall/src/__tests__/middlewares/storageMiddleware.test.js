import storageMiddleware from '../../middlewares/storageMiddleware'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT } from '../../actions/accounts'
import configure from '../../config'

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */

let state
let account
let lock
let network

const create = () => {
  const config = configure()
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()
  const handler = storageMiddleware(config)(store)
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
    it('should retrieve the transactions for that user', async () => {
      expect.assertions(4)
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
})
