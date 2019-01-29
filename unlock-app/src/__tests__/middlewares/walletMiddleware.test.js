import EventEmitter from 'events'
import walletMiddleware from '../../middlewares/walletMiddleware'
import {
  CREATE_LOCK,
  DELETE_LOCK,
  WITHDRAW_FROM_LOCK,
  UPDATE_LOCK_KEY_PRICE,
  UPDATE_LOCK,
} from '../../actions/lock'
import { PURCHASE_KEY } from '../../actions/key'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { SET_PROVIDER } from '../../actions/provider'
import { ADD_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { TRANSACTION_TYPES } from '../../constants'

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

  const handler = walletMiddleware(store)

  const invoke = action => handler(next)(action)

  return { next, invoke, store }
}

/**
 * Mocking walletService
 * Default objects yielded by promises
 */
class MockWalletService extends EventEmitter {
  constructor() {
    super()
    this.ready = true
  }
}

let mockWalletService = new MockWalletService()

jest.mock('../../services/walletService', () => {
  return function() {
    return mockWalletService
  }
})

let mockGenerateJWTToken = jest.fn(() => Promise.resolve())

jest.mock('../../utils/signature', () => () => {
  return mockGenerateJWTToken()
})

beforeEach(() => {
  // Reset the mock
  mockWalletService = new MockWalletService()
  mockGenerateJWTToken = jest.fn(() => Promise.resolve())

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
    transactions: {},
    keys: {},
  }
})

describe('Wallet middleware', () => {
  it('it should handle account.changed events triggered by the walletService', () => {
    expect.assertions(1)
    const { store } = create()
    const address = '0x123'
    const account = {
      address,
    }

    mockWalletService.emit('account.changed', address)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SET_ACCOUNT,
        account,
      })
    )
  })

  it('it should handle transaction.new events triggered by the walletService', () => {
    expect.assertions(1)
    const { store } = create()
    mockWalletService.emit('transaction.new', transaction.hash)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ADD_TRANSACTION,
        transaction,
      })
    )
  })

  it('it should handle lock.updated events triggered by the walletService', () => {
    expect.assertions(1)
    const { store } = create()
    const update = {
      transaction: '0x123',
    }
    mockWalletService.emit('lock.updated', lock.address, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_LOCK,
        address: lock.address,
        update,
      })
    )
  })

  describe('when receiving the ready event triggered by the walletService', () => {
    it('should dispatch queued up actions', () => {
      expect.assertions(1)
      const { store, invoke } = create()

      // Add a pending action
      const action = { type: 'FAKE_ACTION' }
      mockWalletService.ready = false
      mockWalletService.connect = jest.fn()
      invoke(action)

      // Trigger the event
      mockWalletService.emit('ready')
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FAKE_ACTION',
        })
      )
    })
  })

  describe('when receiving a network.changed event triggered by the walletService', () => {
    describe('when the network.changed is different from the store value', () => {
      it('should get a new account', () => {
        expect.assertions(1)
        create()
        const networkId = 1984

        state.network.name = 1773
        mockWalletService.getAccount = jest.fn()
        mockWalletService.emit('network.changed', networkId)
        expect(mockWalletService.getAccount).toHaveBeenCalledWith()
      })

      it('should dispatch a SET_NETWORK action', () => {
        expect.assertions(1)
        const { store } = create()
        const networkId = 1984

        state.network.name = 1773
        mockWalletService.getAccount = jest.fn()
        mockWalletService.emit('network.changed', networkId)
        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: SET_NETWORK,
            network: networkId,
          })
        )
      })
    })
  })

  describe('error events triggered by the walletService', () => {
    it('should handle error triggered when creating a lock', () => {
      expect.assertions(2)
      const { store } = create()
      const transaction = {
        hash: '123',
        type: TRANSACTION_TYPES.LOCK_CREATION,
        lock: '0x123',
      }
      state.transactions = {
        [transaction.hash]: transaction,
      }
      mockWalletService.emit(
        'error',
        { message: 'this was broken' },
        transaction.hash
      )
      expect(store.dispatch).toHaveBeenNthCalledWith(1, {
        type: DELETE_LOCK,
        address: transaction.lock,
      })
      expect(store.dispatch).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: SET_ERROR,
          error: 'Failed to create lock. Did you decline the transaction?',
        })
      )
    })

    it('it should handle error events triggered by the walletService', () => {
      expect.assertions(1)
      const { store } = create()
      mockWalletService.emit('error', { message: 'this was broken' })
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SET_ERROR,
          error: 'this was broken',
        })
      )
    })
  })

  describe('when walletService is not ready', () => {
    it('should connect on any action and stop further execution', () => {
      expect.assertions(2)
      mockWalletService.ready = false
      const { next, invoke } = create()
      const action = { type: 'FAKE_ACTION' }
      mockWalletService.connect = jest.fn()
      invoke(action)
      expect(mockWalletService.connect).toHaveBeenCalledWith('HTTP')
      expect(next).toHaveBeenCalledTimes(0) // ensures that execution was stopped
    })

    it('should propagate the SET_NETWORK action', () => {
      expect.assertions(2)
      mockWalletService.ready = false
      const { next, invoke } = create()
      const action = { type: SET_NETWORK, network: 0 }
      mockWalletService.connect = jest.fn()
      invoke(action)
      expect(mockWalletService.connect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1) // ensures that execution was not stopped
    })

    it('should propagate the SET_ACCOUNT action', () => {
      expect.assertions(2)
      mockWalletService.ready = false
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account: {} }
      mockWalletService.connect = jest.fn()
      invoke(action)
      expect(mockWalletService.connect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1) // ensures that execution was not stopped
    })

    it('should propagate the SET_PROVIDER action', () => {
      expect.assertions(2)
      mockWalletService.ready = false
      const { next, invoke } = create()
      const action = { type: SET_PROVIDER, provider: {} }
      mockWalletService.connect = jest.fn()
      invoke(action)
      expect(mockWalletService.connect).toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1) // ensures that execution was not stopped
    })
  })

  describe('when walletService is ready', () => {
    it('should handle SET_PROVIDER and reset the whole state', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: SET_PROVIDER, provider }
      mockWalletService.connect = jest.fn()
      invoke(action)
      expect(mockWalletService.connect).toHaveBeenCalledWith(provider)
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it("should handle CREATE_LOCK by calling walletService's createLock", () => {
    expect.assertions(3)
    const { next, invoke, store } = create()
    const action = { type: CREATE_LOCK, lock }
    mockWalletService.createLock = jest.fn()

    invoke(action)
    expect(mockWalletService.createLock).toHaveBeenCalledWith(
      lock,
      store.getState().account.address
    )
    expect(mockGenerateJWTToken).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(action)
  })

  it("should handle PURCHASE_KEY by calling walletService's purchaseKey", () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = { type: PURCHASE_KEY, key }
    mockWalletService.purchaseKey = jest.fn()

    invoke(action)
    expect(mockWalletService.purchaseKey).toHaveBeenCalledWith(
      key.lock,
      key.owner,
      lock.keyPrice,
      account.address,
      key.data
    )
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle WITHDRAW_FROM_LOCK by calling withdrawFromLock from walletService', () => {
    expect.assertions(2)
    const { next, invoke, store } = create()
    const action = { type: WITHDRAW_FROM_LOCK, lock }
    mockWalletService.withdrawFromLock = jest.fn()
    invoke(action)

    expect(mockWalletService.withdrawFromLock).toHaveBeenCalledWith(
      lock.address,
      store.getState().account.address
    )
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('UPDATE_LOCK_KEY_PRICE', () => {
    it('should invoke updateKeyPrice on receiving an update request', () => {
      expect.assertions(2)
      const { next, invoke, store } = create()
      const action = {
        type: UPDATE_LOCK_KEY_PRICE,
        address: lock.address,
        price: '0.03',
      }
      mockWalletService.updateKeyPrice = jest.fn()
      invoke(action)

      expect(mockWalletService.updateKeyPrice).toHaveBeenCalledWith(
        lock.address,
        store.getState().account.address,
        '0.03'
      )
      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
