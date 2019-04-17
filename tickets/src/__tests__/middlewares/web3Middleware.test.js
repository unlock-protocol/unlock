import UnlockJs from '@unlock-protocol/unlock-js'
import EventEmitter from 'events'
import web3Middleware from '../../middlewares/web3Middleware'
import { UPDATE_ACCOUNT, setAccount } from '../../actions/accounts'
import { ADD_TRANSACTION, UPDATE_TRANSACTION } from '../../actions/transaction'
import { ADD_LOCK, UPDATE_LOCK } from '../../actions/lock'
import { SET_ERROR } from '../../actions/error'
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

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function() {
    return mockWeb3Service
  },
}))

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
        transaction,
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
          error: 'this was broken',
        })
      )
    })
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
})
