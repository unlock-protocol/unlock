import EventEmitter from 'events'
import { LOCATION_CHANGE } from 'react-router-redux'
import lockMiddleware from '../../middlewares/lockMiddleware'
import {
  ADD_LOCK,
  UPDATE_LOCK,
  CREATE_LOCK,
  LOCK_DEPLOYED,
  WITHDRAW_FROM_LOCK,
} from '../../actions/lock'
import { PURCHASE_KEY, UPDATE_KEY } from '../../actions/key'
import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../../actions/accounts'
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
    keys: {},
  }
})

describe('Lock middleware', () => {
  it('it should handle account.changed events triggered by the web3Service and retrieve the users past transactions', () => {
    expect.assertions(2)
    const { store } = create()
    const address = '0x123'
    const account = {
      address,
    }
    mockWeb3Service.getPastUnlockTransactionsForUser = jest.fn()

    mockWeb3Service.emit('account.changed', account)
    expect(
      mockWeb3Service.getPastUnlockTransactionsForUser
    ).toHaveBeenCalledWith(address)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SET_ACCOUNT,
        account,
      })
    )
  })

  it('should handle account.updated events triggered by the web3Service', () => {
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

  it('it should handle lock.saved events triggered by the web3Service', () => {
    expect.assertions(2)
    const { store } = create()
    const lock = {}
    const address = '0x123'
    mockWeb3Service.refreshAccountBalance = jest.fn()
    mockWeb3Service.getKeyByLockForOwner = jest.fn()

    mockWeb3Service.emit('lock.saved', lock, address)
    expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
      state.account
    )
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LOCK_DEPLOYED,
        lock,
        address,
      })
    )
  })

  describe('lock.updated', () => {
    it('it should dispatch UPDATE_LOCK if the lock already exists ', () => {
      const { store } = create()
      const lock = {
        address: '0x123',
      }
      state.locks = {
        [lock.address]: lock,
      }

      const update = {}
      mockWeb3Service.emit('lock.updated', lock.address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UPDATE_LOCK,
          address: lock.address,
          update,
        })
      )
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
  })

  describe('when handling the key.saved events triggered by the web3Service', () => {
    it('it should reload the lock and the account when the lock exists', () => {
      create()

      const key = {
        lock: lock.address,
      }
      mockWeb3Service.getLock = jest.fn()
      mockWeb3Service.refreshAccountBalance = jest.fn()

      mockWeb3Service.emit('key.saved', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock.address)
      expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
        state.account
      )
    })

    it('it should the account and fetch a new lock when the lock does not exist', () => {
      create()

      const key = {
        lock: '0xAnotherLock',
      }
      mockWeb3Service.getLock = jest.fn()
      mockWeb3Service.refreshAccountBalance = jest.fn()

      mockWeb3Service.emit('key.saved', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith('0xAnotherLock')
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
      payload: { location: { pathname: `/lock/${lock.address}` } },
    }
    mockWeb3Service.getLock = jest.fn()
    invoke(action)
    expect(mockWeb3Service.getLock).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(action)
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
