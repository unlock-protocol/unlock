import UnlockJs from '@unlock-protocol/unlock-js'
import EventEmitter from 'events'
import web3Middleware from '../../middlewares/web3Middleware'
import { UPDATE_ACCOUNT, setAccount } from '../../actions/accounts'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  NEW_TRANSACTION,
} from '../../actions/transaction'
import { ADD_LOCK, UPDATE_LOCK } from '../../actions/lock'
import { SET_ERROR } from '../../actions/error'
import configure from '../../config'
import { SET_PROVIDER, setProvider } from '../../actions/provider'
import { SET_NETWORK, setNetwork } from '../../actions/network'
import { TRANSACTION_TYPES } from '../../constants'
import { ADD_KEY } from '../../actions/key'

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

let transaction = {
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
        hash: '',
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

describe('Web3 middleware', () => {
  describe('lock.updated events triggered by the web3Service', () => {
    it('should dispatch addLock if the lock does not exist yet', () => {
      expect.assertions(1)
      const { store } = create()
      const address = '0x123'
      const update = {
        name: 'My Lock',
      }
      mockWeb3Service.emit('lock.updated', address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ADD_LOCK,
          address,
          lock: update,
        })
      )
    })

    it('should dispatch updateLock if the lock does already exist', () => {
      expect.assertions(1)
      const { store } = create()
      const update = {
        name: 'My Lock',
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
  })

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

  describe('when handling the key.updated events triggered by the web3Service', () => {
    it('it should dispatch updateKey', () => {
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

      mockWeb3Service.emit('key.updated', keyId, { data: 'hello' })
      expect(store.dispatch).toHaveBeenCalledWith({
        type: ADD_KEY,
        id: key.id,
        key: { data: 'hello' },
      })
    })
  })

  describe('when handling the key.saved events triggered by the web3Service', () => {
    it('it should dispatch addKey', () => {
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

      mockWeb3Service.emit('key.updated', keyId, { data: 'hello' })
      expect(store.dispatch).toHaveBeenCalledWith({
        type: ADD_KEY,
        id: key.id,
        key: { data: 'hello' },
      })
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
          error: 'this was broken',
        })
      )
    })
  })

  it('should handle NEW_TRANSACTION', () => {
    expect.assertions(3)
    const {
      next,
      invoke,
      store: { dispatch },
    } = create()
    const action = { type: NEW_TRANSACTION, transaction }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
    )
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('should dispatch key update on NEW_TRANSACTION if it is a key purchase of our lock from us', () => {
    expect.assertions(2)
    state.router = {
      location: {
        pathname: `/${lock.address}`,
        hash: '',
        search: '',
      },
    }
    transaction = {
      ...transaction,
      to: lock.address,
      from: account.address,
      type: TRANSACTION_TYPES.KEY_PURCHASE,
    }
    state.transactions = {
      [transaction.hash]: transaction,
    }
    const { next, invoke } = create()
    const action = { type: NEW_TRANSACTION, transaction }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
    )
  })

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
      mockTx.transactionHash
    )
    expect(mockWeb3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
  })

  it.each([[SET_PROVIDER, setProvider], [SET_NETWORK, setNetwork]])(
    'should refresh the lock if %s is called',
    async (key, action) => {
      expect.assertions(1)
      mockWeb3Service.getLock = jest.fn()

      const lock = '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9'
      state.router.location.pathname = `/${lock}/`

      const { invoke } = create()

      invoke(action('hi'))

      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock)
    }
  )
})
