import UnlockJs from '@unlock-protocol/unlock-js'
import EventEmitter from 'events'
import web3Middleware from '../../middlewares/web3Middleware'
import { ADD_LOCK, UPDATE_LOCK, CREATE_LOCK } from '../../actions/lock'
import { UPDATE_KEY } from '../../actions/key'
import { UPDATE_ACCOUNT, setAccount } from '../../actions/accounts'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  NEW_TRANSACTION,
} from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { SET_KEYS_ON_PAGE_FOR_LOCK } from '../../actions/keysPages'
import { PGN_ITEMS_PER_PAGE, UNLIMITED_KEYS_COUNT } from '../../constants'
import { START_LOADING, DONE_LOADING } from '../../actions/loading'
import configure from '../../config'

/**
 * Fake state
 */
let account = {
  address: '0xabc',
}
let lock = {
  address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  keyPrice: '100',
  owner: account,
}
let state = {}

const transaction = {
  hash: '0xf21e9820af34282c8bebb3a191cf615076ca06026a144c9c28e9cb762585472e',
}
const network = {
  name: 'test',
}

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */
const create = () => {
  const config = configure()
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()

  const handler = web3Middleware(config)(store)

  const invoke = action => handler(next)(action)

  return { next, invoke, store }
}

/**
 * Mocking web3Service
 * Default objects yielded by promises
 */
class MockWebService extends EventEmitter {
  constructor() {
    super()
    this.ready = true
  }
}

let mockWeb3Service = new MockWebService()

jest.mock('@unlock-protocol/unlock-js', () => {
  const mockUnlock = require.requireActual('@unlock-protocol/unlock-js') // Original module
  return {
    ...mockUnlock,
    Web3Service: function() {
      return mockWeb3Service
    },
  }
})

UnlockJs.mockImplementation = MockWebService

beforeEach(() => {
  // Reset the mock
  mockWeb3Service = new MockWebService()

  // Reset state!
  account = {
    address: '0xabc',
  }
  lock = {
    address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    keyPrice: '100',
    owner: account.address,
  }
  state = {
    router: {
      location: {
        pathname: '/dashboard',
      },
    },
    account,
    network,
    provider: 'HTTP',
    locks: {
      [lock.address]: lock,
    },
    transactions: {},
    keys: {},
  }
})

describe('Lock middleware', () => {
  it('should handle account.updated events triggered by the web3Service', () => {
    expect.assertions(1)
    const { store } = create()
    const account = {}
    const update = {
      balance: 1337,
    }
    mockWeb3Service.emit('account.updated', account, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_ACCOUNT,
        update,
      })
    )
  })

  describe('lock.updated', () => {
    describe('if the lock already exists', () => {
      it('should propagate more recent updates', () => {
        expect.assertions(1)
        const { store } = create()
        const lock = {
          address: '0x123',
          asOf: 10,
        }
        state.locks = {
          [lock.address]: lock,
        }
        mockWeb3Service.getKeyByLockForOwner = jest.fn()

        const update = {
          asOf: 11,
        }
        mockWeb3Service.emit('lock.updated', lock.address, update)
        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: UPDATE_LOCK,
            address: lock.address,
            update,
          })
        )
      })

      it('it should not dispatch older updates', () => {
        expect.assertions(1)
        const { store } = create()
        const lock = {
          address: '0x123',
          asOf: 12,
        }
        state.locks = {
          [lock.address]: lock,
        }
        mockWeb3Service.getKeyByLockForOwner = jest.fn()

        const update = {
          asOf: 11,
        }
        mockWeb3Service.emit('lock.updated', lock.address, update)
        expect(store.dispatch).not.toHaveBeenCalled()
      })
    })

    it('it should dispatch ADD_LOCK if the lock does not already exist', () => {
      expect.assertions(1)
      const { store } = create()
      const lock = {
        address: '0x123',
      }

      const update = {}
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      mockWeb3Service.emit('lock.updated', lock.address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ADD_LOCK,
          address: lock.address,
          lock: update,
        })
      )
    })

    it('it should ADD_LOCK with the right unlimitedKey field', () => {
      expect.assertions(1)
      const { store } = create()
      const lock = {
        address: '0x123',
      }

      const update = {
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      }
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      mockWeb3Service.emit('lock.updated', lock.address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ADD_LOCK,
          address: lock.address,
          lock: expect.objectContaining({
            maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
            unlimitedKeys: true,
          }),
        })
      )
    })
  })

  describe('when handling the key.saved events triggered by the web3Service', () => {
    it('it should reload the lock, the account and get the corresponding key for the current user', () => {
      expect.assertions(3)
      create()

      const key = {
        id: '0xabc',
        lock: lock.address,
        owner: state.account.address,
      }
      mockWeb3Service.getLock = jest.fn()
      mockWeb3Service.refreshAccountBalance = jest.fn()
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      mockWeb3Service.emit('key.saved', '0xabc', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock.address)
      expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
        lock.address,
        state.account.address
      )
      expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
        state.account
      )
    })
  })

  describe('when handling the key.updated events triggered by the web3Service', () => {
    it('it dispatch updateKey', () => {
      expect.assertions(1)
      const { store } = create()

      const keyId = 'keyId'
      const key = {
        id: keyId,
        lock: lock.address,
      }

      state.keys = {
        [keyId]: key,
      }
      const update = {
        data: 'hello',
      }

      mockWeb3Service.emit('key.updated', keyId, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UPDATE_KEY,
          id: key.id,
          update,
        })
      )
    })
  })

  it('it should handle transaction.new events triggered by the web3Service', () => {
    expect.assertions(1)

    const { store } = create()
    mockWeb3Service.getTransaction = jest.fn()

    mockWeb3Service.emit('transaction.new', transaction.hash)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ADD_TRANSACTION,
        transaction: {
          hash: transaction.hash,
          network: 'test',
        },
      })
    )
  })

  it('it should handle transaction.updated events triggered by the web3Service', () => {
    expect.assertions(1)
    const { store } = create()
    const update = {}
    mockWeb3Service.emit('transaction.updated', transaction.hash, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update,
      })
    )
  })

  describe('when receiving a keys.page event triggered by the web3Service', () => {
    it('should dispatch setKeysOnPageForLock', () => {
      expect.assertions(1)
      const { store } = create()
      const lock = '0x123'
      const page = 1336
      const keys = []
      mockWeb3Service.emit('keys.page', lock, page, keys)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SET_KEYS_ON_PAGE_FOR_LOCK,
          page,
          lock,
          keys,
        })
      )
    })
  })

  describe('error events triggered by the web3Service', () => {
    it('it should handle error events triggered by the web3Service', () => {
      expect.assertions(1)
      const { store } = create()
      mockWeb3Service.emit('error', { message: 'this was broken' })
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SET_ERROR,
          error: {
            kind: 'Web3',
            level: 'Diagnostic',
            message: 'this was broken',
          },
        })
      )
    })
  })

  describe('not on the paywall', () => {
    it('should handle SET_ACCOUNT by refreshing balance and retrieving historical unlock transactions', async () => {
      expect.assertions(4)
      const mockTx = {
        transactionHash: '0x123',
      }
      mockWeb3Service.refreshAccountBalance = jest.fn()
      const lockCreationTransaction = Promise.resolve([mockTx])
      mockWeb3Service.getPastLockCreationsTransactionsForUser = jest.fn(
        () => lockCreationTransaction
      )
      mockWeb3Service.getKeyByLockForOwner = jest.fn()
      mockWeb3Service.getTransaction = jest.fn()

      const { invoke } = create()

      const newAccount = {
        address: '0x345',
      }
      invoke(setAccount(newAccount))

      expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
        newAccount
      )
      expect(
        mockWeb3Service.getPastLockCreationsTransactionsForUser
      ).toHaveBeenCalledWith(newAccount.address)
      // We need to await this for the next assertion to work
      await lockCreationTransaction

      expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
        mockTx.transactionHash,
        { network: 'test' }
      )
      expect(mockWeb3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
    })
  })

  describe('SET_KEYS_ON_PAGE_FOR_LOCK', () => {
    it('should call getKeysForLockOnPage on web3Service only if the keys variable is falsy', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const page = 1
      const action = {
        type: SET_KEYS_ON_PAGE_FOR_LOCK,
        lock: lock.address,
        page,
      }
      mockWeb3Service.getKeysForLockOnPage = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeysForLockOnPage).toHaveBeenCalledWith(
        lock.address,
        page,
        PGN_ITEMS_PER_PAGE
      )
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should not call getKeysForLockOnPage if the keys are set', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const page = 1
      const action = {
        type: SET_KEYS_ON_PAGE_FOR_LOCK,
        lock: lock.address,
        page,
        keys: [],
      }
      mockWeb3Service.getKeysForLockOnPage = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeysForLockOnPage).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it('should handle ADD_TRANSACTION', async () => {
    expect.assertions(4)
    const { next, invoke, store } = create()
    const action = { type: ADD_TRANSACTION, transaction }
    const web3Transaction = {}
    const transactionPromise = Promise.resolve(web3Transaction)
    mockWeb3Service.getTransaction = jest.fn(() => transactionPromise)

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: START_LOADING,
      })
    )
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
    )
    await transactionPromise
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DONE_LOADING,
      })
    )
  })

  it('should handle NEW_TRANSACTION', async () => {
    expect.assertions(4)
    const { next, invoke, store } = create()
    const action = { type: NEW_TRANSACTION, transaction }
    const web3Transaction = {}
    const transactionPromise = Promise.resolve(web3Transaction)
    mockWeb3Service.getTransaction = jest.fn(() => transactionPromise)

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: START_LOADING,
      })
    )
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
    )
    await transactionPromise
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DONE_LOADING,
      })
    )
  })

  describe('CREATE_LOCK', () => {
    it('should generateLockAddress if the address is missing', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const lock = {
        name: 'my lock',
      }
      const address = '0x123'
      const action = { type: CREATE_LOCK, lock }
      mockWeb3Service.generateLockAddress = jest.fn(() => {
        return Promise.resolve(address)
      })

      invoke(action)
      expect(mockWeb3Service.generateLockAddress).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should do nothing is the lock has an address', () => {
      expect.assertions(2)
      let lock = {
        keyPrice: '100',
        owner: account,
        address: '0x123',
      }
      const { next, invoke } = create()
      const action = { type: CREATE_LOCK, lock }
      mockWeb3Service.generateLockAddress = jest.fn()

      invoke(action)
      expect(next).toHaveBeenCalled()
      expect(mockWeb3Service.generateLockAddress).not.toHaveBeenCalled()
    })
  })
})
