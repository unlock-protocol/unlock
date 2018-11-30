import EventEmitter from 'events'
import { LOCATION_CHANGE } from 'react-router-redux'
import lockMiddleware from '../../middlewares/lockMiddleware'
import {
  UPDATE_LOCK,
  CREATE_LOCK,
  LOCK_DEPLOYED,
  SET_LOCK,
  WITHDRAW_FROM_LOCK,
} from '../../actions/lock'
import { PURCHASE_KEY, UPDATE_KEY } from '../../actions/key'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { SET_PROVIDER } from '../../actions/provider'
import { ADD_TRANSACTION, UPDATE_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'

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

let key = {
  id: '123',
  lock: lock.address,
  owner: account.address,
}

const transaction = {
  hash: '0xf21e9820af34282c8bebb3a191cf615076ca06026a144c9c28e9cb762585472e',
}
const network = {
  name: 'test',
}
const provider = 'Toshi'

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

  const handler = lockMiddleware(store)

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

jest.mock('../../services/web3Service', () => {
  return function() {
    return mockWeb3Service
  }
})

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
    account,
    network,
    provider: 'HTTP',
    locks: {
      [lock.address]: lock,
    },
  }
})

describe('Lock middleware', () => {
  it('it should handle account.changed events triggered by the web3Service', () => {
    const { store } = create()
    const account = {}
    mockWeb3Service.emit('account.changed', account)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SET_ACCOUNT,
        account,
      })
    )
  })

  it('it should handle lock.saved events triggered by the web3Service', () => {
    const { store } = create()
    const lock = {}
    const address = '0x123'
    mockWeb3Service.refreshOrGetAccount = jest.fn()
    mockWeb3Service.getLock = jest.fn()

    mockWeb3Service.emit('lock.saved', lock, address)
    expect(mockWeb3Service.refreshOrGetAccount).toHaveBeenCalledWith(
      state.account
    )
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LOCK_DEPLOYED,
        lock,
        address,
      })
    )
  })

  it('it should handle lock.updated events triggered by the web3Service', () => {
    const { store } = create()
    const lock = {
      address: '0x123',
    }
    const update = {}
    mockWeb3Service.emit('lock.updated', lock, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_LOCK,
        address: lock.address,
        update,
      })
    )
  })

  describe('when handling the key.saved events triggered by the web3Service', () => {
    it('it should reload the lock and the account when the lock exists', () => {
      create()

      const key = {
        lock: lock.address,
      }
      mockWeb3Service.getLock = jest.fn()
      mockWeb3Service.refreshOrGetAccount = jest.fn()

      mockWeb3Service.emit('key.saved', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock)
      expect(mockWeb3Service.refreshOrGetAccount).toHaveBeenCalledWith(
        state.account
      )
    })

    it('it should the account and fetch a new lock when the lock does not exist', () => {
      create()

      const key = {
        lock: '0xAnotherLock',
      }
      mockWeb3Service.getLock = jest.fn()
      mockWeb3Service.refreshOrGetAccount = jest.fn()

      mockWeb3Service.emit('key.saved', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith({
        address: '0xAnotherLock',
      })
      expect(mockWeb3Service.refreshOrGetAccount).toHaveBeenCalledWith(
        state.account
      )
    })
  })

  describe.only('when handling the key.updated events triggered by the web3Service', () => {
    it('it dispatch updateKey', () => {
      expect.assertions(1)
      const { store } = create()

      const key = {
        id: 'keyId',
        lock: lock.address,
      }
      const update = {
        data: 'hello',
      }

      mockWeb3Service.emit('key.updated', key, update)
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
    const { store } = create()
    mockWeb3Service.emit('transaction.new', transaction)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ADD_TRANSACTION,
        transaction,
      })
    )
  })

  it('it should handle transaction.updated events triggered by the web3Service', () => {
    const { store } = create()
    const update = {}
    mockWeb3Service.emit('transaction.updated', transaction, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update,
      })
    )
  })

  describe('when receiving a network.changed event triggered by the web3Service', () => {
    it('should dispatch queued up actions', () => {
      const { store, invoke } = create()

      // Add a pending action
      const action = { type: 'FAKE_ACTION' }
      mockWeb3Service.ready = false
      mockWeb3Service.connect = jest.fn()
      mockWeb3Service.refreshOrGetAccount = jest.fn()
      invoke(action)

      // Trigger the event
      mockWeb3Service.emit('network.changed', 123)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FAKE_ACTION',
        })
      )
    })

    describe('when the network.changed is different from the store value', () => {
      it('should get a new account', () => {
        create()
        const networkId = 1984

        state.network.name = 1773
        mockWeb3Service.refreshOrGetAccount = jest.fn()
        mockWeb3Service.emit('network.changed', networkId)
        expect(mockWeb3Service.refreshOrGetAccount).toHaveBeenCalledWith()
      })

      it('should dispatch a SET_NETWORK action', () => {
        const { store } = create()
        const networkId = 1984

        state.network.name = 1773
        mockWeb3Service.refreshOrGetAccount = jest.fn()
        mockWeb3Service.emit('network.changed', networkId)
        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: SET_NETWORK,
            network: networkId,
          })
        )
      })
    })

    describe('when the network.changed is the same as the store value', () => {
      it('should refresh transactions, keys, locks and the account', () => {
        const { store } = create()
        const networkId = 1984

        mockWeb3Service.getTransaction = jest.fn()
        mockWeb3Service.getKey = jest.fn()
        mockWeb3Service.getLock = jest.fn()
        mockWeb3Service.refreshOrGetAccount = jest.fn()

        state.network.name = networkId
        state.transactions = {
          [transaction.hash]: transaction,
        }
        state.keys = {
          [key.id]: key,
        }
        state.locks = {
          [lock.address]: lock,
        }
        mockWeb3Service.emit('network.changed', networkId)
        expect(store.dispatch).not.toHaveBeenCalled()
        expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(transaction)
        expect(mockWeb3Service.getKey).toHaveBeenCalledWith(key)
        expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock)
        expect(mockWeb3Service.refreshOrGetAccount).toHaveBeenCalledWith(
          account
        )
      })
    })
  })

  it('it should handle error events triggered by the web3Service', () => {
    const { store } = create()
    mockWeb3Service.emit('error', { message: 'this was broken' })
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SET_ERROR,
        error: expect.anything(), // not sure how to test against jsx
      })
    )
  })

  describe('when web3Service is not ready', () => {
    it('should connect on any action and stop further execution', () => {
      mockWeb3Service.ready = false
      const { next, invoke } = create()
      const action = { type: SET_NETWORK, network }
      mockWeb3Service.connect = jest.fn()
      invoke(action)
      expect(mockWeb3Service.connect).toHaveBeenCalledWith({
        provider: 'HTTP',
      })
      expect(next).toHaveBeenCalledTimes(0) // ensures that execution was stopped
    })
  })

  describe('when web3Service is ready', () => {
    it('should handle SET_PROVIDER and reset the whole state', () => {
      const { next, invoke } = create()
      const action = { type: SET_PROVIDER, provider }
      mockWeb3Service.connect = jest.fn()
      invoke(action)
      expect(mockWeb3Service.connect).toHaveBeenCalledWith({
        provider: provider,
      })
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it('should handle CREATE_LOCK by calling web3Service\'s createLock', () => {
    const { next, invoke, store } = create()
    const action = { type: CREATE_LOCK, lock }
    mockWeb3Service.createLock = jest.fn()

    invoke(action)
    expect(mockWeb3Service.createLock).toHaveBeenCalledWith(
      lock,
      store.getState().account
    )
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle PURCHASE_KEY by calling web3Service\'s purchaseKey', () => {
    const { next, invoke } = create()
    const action = { type: PURCHASE_KEY, key }
    mockWeb3Service.purchaseKey = jest.fn()

    invoke(action)
    expect(mockWeb3Service.purchaseKey).toHaveBeenCalledWith(key, account, lock)
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle LOCATION_CHANGE by calling web3Service\'s getLock', () => {
    const { next, invoke } = create()
    const action = {
      type: LOCATION_CHANGE,
      payload: { pathname: `/lock/${lock.address}` },
    }
    mockWeb3Service.getLock = jest.fn()
    invoke(action)
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith({
      address: lock.address,
    })
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('when SET_ACCOUNT was called', () => {
    it('should call getKey if the lock is set', () => {
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account }
      state.network.lock = lock
      mockWeb3Service.getKey = jest.fn()
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledWith({
        lock: lock.address,
        owner: account,
      })
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should not call getKey if the lock is not set', () => {
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account }
      delete state.network.lock
      mockWeb3Service.getKey = jest.fn()
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledTimes(0)
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('when SET_LOCK was called', () => {
    it('should call getKey', () => {
      const { next, invoke } = create()
      const action = { type: SET_LOCK, lock }
      state.account = account
      mockWeb3Service.getKey = jest.fn()
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledWith({
        lock: lock.address,
        owner: account,
      })
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should call getKey if the account is not set', () => {
      const { next, invoke } = create()
      const action = { type: SET_LOCK, lock }
      state.account = null
      mockWeb3Service.getKey = jest.fn()
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledWith({
        lock: lock.address,
        owner: null,
      })
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it('should handle WITHDRAW_FROM_LOCK by calling withdrawFromLock from web3Service', () => {
    const { next, invoke, store } = create()
    const action = { type: WITHDRAW_FROM_LOCK, lock }
    mockWeb3Service.withdrawFromLock = jest.fn()
    invoke(action)

    expect(mockWeb3Service.withdrawFromLock).toHaveBeenCalledWith(
      lock,
      store.getState().account
    )
    expect(next).toHaveBeenCalledWith(action)
  })
})
