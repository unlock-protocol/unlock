import EventEmitter from 'events'
import web3Middleware from '../../middlewares/web3Middleware'
import { GET_LOCK, UPDATE_LOCK, CREATE_LOCK } from '../../actions/lock'
import { UPDATE_ACCOUNT } from '../../actions/accounts'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  NEW_TRANSACTION,
} from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { UNLIMITED_KEYS_COUNT } from '../../constants'
import { START_LOADING, DONE_LOADING } from '../../actions/loading'

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
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()

  const handler = web3Middleware(mockWeb3Service)(store)

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

beforeEach(() => {
  // Reset the mock
  mockWeb3Service = new MockWebService()
  jest.clearAllMocks()

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

    it('it should dispatch UPDATE_LOCK if the lock does not already exist', () => {
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
          type: UPDATE_LOCK,
          address: lock.address,
          update,
        })
      )
    })

    it('it should UPDATE_LOCK with the right unlimitedKey field', () => {
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
          type: UPDATE_LOCK,
          address: lock.address,
          update: expect.objectContaining({
            maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
            unlimitedKeys: true,
          }),
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
        owner: '0xdeadbeef',
        name: 'my lock',
      }
      const address = '0x123'
      const action = { type: CREATE_LOCK, lock }
      mockWeb3Service.generateLockAddress = jest.fn(() => {
        return Promise.resolve(address)
      })

      invoke(action)
      expect(mockWeb3Service.generateLockAddress).toHaveBeenCalledWith(
        lock.owner,
        lock
      )
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should do nothing is the lock has an address', () => {
      expect.assertions(2)
      const lock = {
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

  describe('GET_LOCK', () => {
    it('should retrieve the locks using web3Service', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const address = '0x123'
      const lock = {
        address,
      }
      const action = { type: GET_LOCK, address, lock }
      mockWeb3Service.getLock = jest.fn()

      invoke(action)
      expect(next).toHaveBeenCalled()
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(address)
    })
  })
})
