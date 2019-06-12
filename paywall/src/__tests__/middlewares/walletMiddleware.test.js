import EventEmitter from 'events'
import walletMiddleware from '../../middlewares/walletMiddleware'
import {
  WAIT_FOR_WALLET,
  GOT_WALLET,
  DISMISS_CHECK,
} from '../../actions/walletStatus'
import { PURCHASE_KEY } from '../../actions/key'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { PROVIDER_READY } from '../../actions/provider'
import { NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { POLLING_INTERVAL } from '../../constants'
import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_NON_DEPLOYED_CONTRACT,
} from '../../errors'
import { UPDATE_LOCK } from '../../actions/lock'

let mockConfig

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
  currencyContractAddress: '0xerc20',
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

  const handler = walletMiddleware(mockConfig)(store)

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

jest.mock('@unlock-protocol/unlock-js', () => {
  const mockUnlock = require.requireActual('@unlock-protocol/unlock-js') // Original module
  return {
    ...mockUnlock,
    WalletService: function() {
      return mockWalletService
    },
  }
})

jest.useFakeTimers()

beforeEach(() => {
  mockConfig = jest.requireActual('../../config').default()
  // Reset the mock
  mockWalletService = new MockWalletService()

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
  it('should handle account.changed events triggered by the walletService', () => {
    expect.assertions(3)
    const { store } = create()
    const address = '0x123'
    const account = {
      address,
    }
    mockWalletService.getAccount = jest.fn()

    mockWalletService.emit('account.changed', address)

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: SET_ACCOUNT,
        account,
      })
    )

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      POLLING_INTERVAL
    )
  })
  it('on the server, it should not handle account.changed events triggered by the walletService', () => {
    expect.assertions(2)
    setTimeout.mockClear()
    mockConfig.isServer = true
    const { store } = create()
    const address = '0x123'
    const account = {
      address,
    }
    mockWalletService.getAccount = jest.fn()

    mockWalletService.emit('account.changed', address)

    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: SET_ACCOUNT,
        account,
      })
    )

    expect(setTimeout).not.toHaveBeenCalled()
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
      it('should dispatch an error if it could not check whether the contract was deployed', () => {
        expect.assertions(2)
        const { store } = create()
        const networkId = 1984
        const error = new Error('An error')
        mockWalletService.getAccount = jest.fn()
        mockWalletService.isUnlockContractDeployed = jest.fn(callback => {
          return callback(error)
        })

        mockWalletService.emit('network.changed', networkId)

        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: SET_ERROR,
            error: error.message,
          })
        )

        expect(mockWalletService.getAccount).not.toHaveBeenCalled()
      })

      it('should dispatch FATAL_NON_DEPLOYED_CONTRACT if the contract was not deployed', () => {
        expect.assertions(2)
        const { store } = create()
        const networkId = 1984

        mockWalletService.getAccount = jest.fn()
        mockWalletService.isUnlockContractDeployed = jest.fn(callback => {
          return callback(null, false /* non deployed */)
        })

        mockWalletService.emit('network.changed', networkId)

        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: SET_ERROR,
            error: FATAL_NON_DEPLOYED_CONTRACT,
          })
        )

        expect(mockWalletService.getAccount).not.toHaveBeenCalled()
      })

      describe('if the contract was deployed', () => {
        it('should get a new account', () => {
          expect.assertions(1)
          create()
          const networkId = 1984

          state.network.name = 1773
          mockWalletService.getAccount = jest.fn()
          mockWalletService.isUnlockContractDeployed = jest.fn(callback => {
            return callback(null, true /* deployed */)
          })

          mockWalletService.emit('network.changed', networkId)
          expect(mockWalletService.getAccount).toHaveBeenCalledWith(true) // create an account if none is set
        })
      })

      it('should dispatch a SET_NETWORK action if the network has changed', () => {
        expect.assertions(1)
        const { store } = create()
        const networkId = 1984

        state.network.name = 1773
        mockWalletService.getAccount = jest.fn()
        mockWalletService.isUnlockContractDeployed = jest.fn()
        mockWalletService.emit('network.changed', networkId)
        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: SET_NETWORK,
            network: networkId,
          })
        )
      })

      it('should not dispatch a SET_NETWORK action if the network has not changed', () => {
        expect.assertions(1)
        const { store } = create()
        const networkId = 1984

        state.network.name = 1984
        mockWalletService.getAccount = jest.fn()
        mockWalletService.isUnlockContractDeployed = jest.fn()
        mockWalletService.emit('network.changed', networkId)
        expect(store.dispatch).not.toHaveBeenCalled()
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

  it('should handle PROVIDER_READY and connect', () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = { type: PROVIDER_READY }
    mockWalletService.connect = jest.fn()
    invoke(action)
    expect(mockWalletService.connect).toHaveBeenCalledWith(
      mockConfig.providers[state.provider]
    )
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
        type: SET_ERROR,
        error: FATAL_NO_USER_ACCOUNT,
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
        null,
        null,
        lock.currencyContractAddress
      )
      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
