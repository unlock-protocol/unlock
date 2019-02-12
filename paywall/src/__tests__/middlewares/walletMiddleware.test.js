import EventEmitter from 'events'
import walletMiddleware from '../../middlewares/walletMiddleware'
import { UPDATE_LOCK_KEY_PRICE, UPDATE_LOCK } from '../../actions/lock'
import {
  WAIT_FOR_WALLET,
  GOT_WALLET,
  DISMISS_CHECK,
} from '../../actions/walletStatus'
import { PURCHASE_KEY } from '../../actions/key'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { SET_PROVIDER } from '../../actions/provider'
import { NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { NO_USER_ACCOUNT } from '../../errors'

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
  connect() {}
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
    walletStatus: {
      waiting: true,
    },
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

  it('should handle transaction.pending events triggered by the walletService', () => {
    expect.assertions(1)
    const { store } = create()
    mockWalletService.emit('transaction.pending')
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: WAIT_FOR_WALLET })
    )
  })

  it('should handle transaction.new events triggered by the walletService', () => {
    expect.assertions(2)
    const { store } = create()
    const from = '0xjulien'
    const to = '0xunlock'
    const input = 'input'
    mockWalletService.emit('transaction.new', transaction.hash, from, to, input)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: GOT_WALLET })
    )
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NEW_TRANSACTION,
        transaction: expect.objectContaining({
          hash: transaction.hash,
          to,
          from,
          input,
        }),
      })
    )
  })

  it('should handle overlay.dismissed events triggered by walletService', () => {
    expect.assertions(1)
    const { store } = create()
    mockWalletService.emit('overlay.dismissed')
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: DISMISS_CHECK })
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

  it('should handle SET_PROVIDER and re connect', () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = { type: SET_PROVIDER, provider }
    mockWalletService.connect = jest.fn()
    invoke(action)
    expect(mockWalletService.connect).toHaveBeenCalledWith(provider)
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('PURCHASE_KEY', () => {
    it('when the service is not ready it should set an error and not try to purchase the key', () => {
      expect.assertions(3)
      const { next, invoke, store } = create()
      const action = { type: PURCHASE_KEY, key }
      mockWalletService.purchaseKey = jest.fn()
      mockWalletService.ready = false
      invoke(action)
      expect(store.dispatch).toHaveBeenCalledWith({
        type: 'error/SET_ERROR',
        error: NO_USER_ACCOUNT,
      })

      expect(mockWalletService.purchaseKey).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })

    it("should handle PURCHASE_KEY by calling walletService's purchaseKey when the walletService is ready", () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: PURCHASE_KEY, key }
      mockWalletService.purchaseKey = jest.fn()
      mockWalletService.ready = true
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
  })
})
