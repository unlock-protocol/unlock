import EventEmitter from 'events'
import walletMiddleware from '../../middlewares/walletMiddleware'
import {
  CREATE_LOCK,
  DELETE_LOCK,
  WITHDRAW_FROM_LOCK,
  UPDATE_LOCK_KEY_PRICE,
  UPDATE_LOCK,
} from '../../actions/lock'
import { LAUNCH_MODAL, DISMISS_MODAL } from '../../actions/fullScreenModals'
import { PURCHASE_KEY } from '../../actions/key'
import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { PROVIDER_READY } from '../../actions/provider'
import { NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { POLLING_INTERVAL } from '../../constants'
import { TransactionType } from '../../unlockTypes'
import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_NON_DEPLOYED_CONTRACT,
  FATAL_WRONG_NETWORK,
} from '../../errors'
import { HIDE_FORM } from '../../actions/lockFormVisibility'
import { GET_STORED_PAYMENT_DETAILS } from '../../actions/user'

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
const create = (dispatchImplementation = () => true) => {
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn((...args) => dispatchImplementation(...args)),
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
  describe('when receiving account.updated events triggered by the walletService', () => {
    it('should handle non-redundant account.updated events', () => {
      expect.assertions(2)
      const { store } = create()
      const emailAddress = 'geoff@bitconnect.gov'
      const update = {
        emailAddress,
      }

      mockWalletService.emit('account.updated', update)

      expect(store.dispatch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: UPDATE_ACCOUNT,
          update: {
            emailAddress,
          },
        })
      )

      expect(store.dispatch).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: GET_STORED_PAYMENT_DETAILS,
          emailAddress,
        })
      )
    })

    it('should not dispatch redundant updates triggered by the walletService', () => {
      expect.assertions(1)
      const { store } = create()
      const update = {
        address: '0xabc',
      }

      mockWalletService.emit('account.updated', update)

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  it.skip('should handle account.changed events triggered by the walletService', () => {
    expect.assertions(3)
    const { store } = create()
    const address = '0x123'
    const account = {
      address,
    }
    setTimeout.mockClear()
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
      expect.objectContaining({ type: LAUNCH_MODAL })
    )
  })

  it('should handle transaction.new events triggered by the walletService', () => {
    expect.assertions(2)
    const { store } = create()
    const from = '0xjulien'
    const to = '0xunlock'
    const input = 'input'
    const type = 'LOCK_CREATION'
    const status = 'submitted'
    mockWalletService.emit(
      'transaction.new',
      transaction.hash,
      from,
      to,
      input,
      type,
      status
    )
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: DISMISS_MODAL })
    )
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NEW_TRANSACTION,
        transaction: expect.objectContaining({
          hash: transaction.hash,
          to,
          from,
          input,
          type: 'Lock Creation',
          status,
        }),
      })
    )
  })

  it('should handle overlay.dismissed events triggered by walletService', () => {
    expect.assertions(1)
    const { store } = create()
    mockWalletService.emit('overlay.dismissed')
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: DISMISS_MODAL })
    )
  })

  it('it should handle lock.updated events triggered by the walletService', () => {
    expect.assertions(2)
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
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HIDE_FORM,
      })
    )
  })

  describe('when receiving a network.changed event triggered by the walletService', () => {
    describe('when the network.changed is different from the store value', () => {
      describe('when the network does not match the required network', () => {
        it('should dispatch an error', () => {
          expect.assertions(2)
          const { store } = create()
          const networkId = 1984
          mockWalletService.isUnlockContractDeployed = jest.fn()
          mockConfig.isRequiredNetwork = jest.fn(() => false)
          mockWalletService.emit('network.changed', networkId)

          expect(store.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
              type: SET_ERROR,
              error: {
                level: 'Fatal',
                kind: 'Application',
                message: FATAL_WRONG_NETWORK,
                data: {
                  currentNetwork: 'Winston',
                  requiredNetworkId: 1984,
                },
              },
            })
          )
          expect(
            mockWalletService.isUnlockContractDeployed
          ).not.toHaveBeenCalled()
        })
      })

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
            error: {
              level: 'Fatal',
              kind: 'Application',
              message: 'An error',
            },
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
            error: {
              level: 'Fatal',
              kind: 'Application',
              message: FATAL_NON_DEPLOYED_CONTRACT,
            },
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

      it('should dispatch a SET_NETWORK action', () => {
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
    })
  })

  describe('error events triggered by the walletService', () => {
    it('should handle error triggered when creating a lock', () => {
      expect.assertions(3)
      const { store } = create()
      const transaction = {
        hash: '123',
        type: TransactionType.LOCK_CREATION,
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
      expect(store.dispatch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ type: DISMISS_MODAL })
      )
      expect(store.dispatch).toHaveBeenNthCalledWith(2, {
        type: DELETE_LOCK,
        address: transaction.lock,
      })
      expect(store.dispatch).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          type: SET_ERROR,
          error: {
            level: 'Warning',
            kind: 'Transaction',
            message: 'Failed to create lock. Did you decline the transaction?',
          },
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
          error: {
            level: 'Warning',
            kind: 'Transaction',
            message: 'this was broken',
          },
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
        error: {
          level: 'Fatal',
          kind: 'Application',
          message: FATAL_NO_USER_ACCOUNT,
        },
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

  describe('WITHDRAW_FROM_LOCK', () => {
    it('when the service is not ready it should set an error and not try to withdraw from the lock', () => {
      expect.assertions(3)
      const { next, invoke, store } = create()
      const action = { type: WITHDRAW_FROM_LOCK, lock }
      mockWalletService.withdrawFromLock = jest.fn()
      mockWalletService.ready = false
      invoke(action)
      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_ERROR,
        error: {
          level: 'Fatal',
          kind: 'Application',
          message: FATAL_NO_USER_ACCOUNT,
        },
      })

      expect(mockWalletService.withdrawFromLock).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should handle WITHDRAW_FROM_LOCK by calling withdrawFromLock from walletService', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: WITHDRAW_FROM_LOCK, lock }
      mockWalletService.withdrawFromLock = jest.fn()
      mockWalletService.ready = true
      invoke(action)
      expect(mockWalletService.withdrawFromLock).toHaveBeenCalledWith(
        lock.address
      )
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('CREATE_LOCK', () => {
    describe('when the lock has an address', () => {
      it('when the service is not ready it should set an error and not try to create the lock', () => {
        expect.assertions(3)
        const { next, invoke, store } = create()
        const action = { type: CREATE_LOCK, lock }
        mockWalletService.createLock = jest.fn()
        mockWalletService.ready = false
        invoke(action)
        expect(store.dispatch).toHaveBeenCalledWith({
          type: SET_ERROR,
          error: {
            level: 'Fatal',
            kind: 'Application',
            message: FATAL_NO_USER_ACCOUNT,
          },
        })

        expect(mockWalletService.createLock).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(action)
      })

      it("should handle CREATE_LOCK by calling walletService's createLock", () => {
        expect.assertions(2)
        const { next, invoke, store } = create()
        const action = { type: CREATE_LOCK, lock }

        mockWalletService.createLock = jest
          .fn()
          .mockImplementation(() => Promise.resolve())
        mockWalletService.ready = true

        invoke(action)
        expect(mockWalletService.createLock).toHaveBeenCalledWith(
          lock,
          store.getState().account.address
        )

        expect(next).toHaveBeenCalledWith(action)
      })
    })

    describe('when the lock does not have an address', () => {
      it('should not try to createLock', () => {
        expect.assertions(2)
        let lock = {
          keyPrice: '100',
          owner: account,
        }
        mockWalletService.createLock = jest.fn()
        const { next, invoke } = create()
        const action = { type: CREATE_LOCK, lock }
        mockWalletService.ready = true

        invoke(action)
        expect(next).toHaveBeenCalled()
        expect(mockWalletService.createLock).not.toHaveBeenCalled()
      })
    })
  })

  describe('UPDATE_LOCK_KEY_PRICE', () => {
    it('when the service is not ready it should set an error and not try to update the key price', () => {
      expect.assertions(3)
      const { next, invoke, store } = create()
      const action = { type: UPDATE_LOCK_KEY_PRICE, lock }
      mockWalletService.updateKeyPrice = jest.fn()
      mockWalletService.ready = false
      invoke(action)
      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_ERROR,
        error: {
          level: 'Fatal',
          kind: 'Application',
          message: FATAL_NO_USER_ACCOUNT,
        },
      })

      expect(mockWalletService.updateKeyPrice).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should invoke updateKeyPrice on receiving an update request', () => {
      expect.assertions(2)
      const { next, invoke, store } = create()
      const action = {
        type: UPDATE_LOCK_KEY_PRICE,
        address: lock.address,
        price: '0.03',
      }
      mockWalletService.updateKeyPrice = jest.fn()
      mockWalletService.ready = true
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
