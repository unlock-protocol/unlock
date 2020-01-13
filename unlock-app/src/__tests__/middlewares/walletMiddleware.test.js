import EventEmitter from 'events'
import walletMiddleware from '../../middlewares/walletMiddleware'
import {
  CREATE_LOCK,
  DELETE_LOCK,
  WITHDRAW_FROM_LOCK,
  UPDATE_LOCK_KEY_PRICE,
  UPDATE_LOCK,
} from '../../actions/lock'
import {
  LAUNCH_MODAL,
  DISMISS_MODAL,
  waitForWallet,
  dismissWalletCheck,
} from '../../actions/fullScreenModals'
import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { PROVIDER_READY } from '../../actions/provider'
import { NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { ACCOUNT_POLLING_INTERVAL } from '../../constants'
import { TransactionType } from '../../unlockTypes'
import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_NON_DEPLOYED_CONTRACT,
  FATAL_WRONG_NETWORK,
} from '../../errors'
import { HIDE_FORM } from '../../actions/lockFormVisibility'
import { GET_STORED_PAYMENT_DETAILS } from '../../actions/user'
import { SIGN_DATA } from '../../actions/signature'
import {
  SIGN_BULK_METADATA_REQUEST,
  SIGN_BULK_METADATA_RESPONSE,
} from '../../actions/keyMetadata'

let mockConfig

/**
 * Fake state
 */
let account = {}
let lock = {}
let state = {}
const transaction = {}
const network = {}

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
    WalletService() {
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
    expirationDuration: 60 * 60 * 24 * 30,
    maxNumberOfKeys: -1,
    name: 'My Fancy Lock',
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

  it('should handle account.changed events triggered by the walletService', () => {
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
      ACCOUNT_POLLING_INTERVAL
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
      expect(mockWalletService.withdrawFromLock).toHaveBeenCalledWith({
        lockAddress: lock.address,
      })
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
        const { next, invoke } = create()
        const action = { type: CREATE_LOCK, lock }

        mockWalletService.createLock = jest
          .fn()
          .mockImplementation(() => Promise.resolve())
        mockWalletService.ready = true

        invoke(action)
        expect(mockWalletService.createLock).toHaveBeenCalledWith({
          currencyContractAddress: lock.currencyContractAddress,
          expirationDuration: lock.expirationDuration,
          keyPrice: lock.keyPrice,
          maxNumberOfKeys: lock.maxNumberOfKeys,
          name: lock.name,
          owner: lock.owner,
        })

        expect(next).toHaveBeenCalledWith(action)
      })
    })

    describe('when the lock does not have an address', () => {
      it('should not try to createLock', () => {
        expect.assertions(2)
        const lock = {
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
      const { next, invoke } = create()
      const action = {
        type: UPDATE_LOCK_KEY_PRICE,
        address: lock.address,
        price: '0.03',
      }
      mockWalletService.updateKeyPrice = jest.fn()
      mockWalletService.ready = true
      invoke(action)
      expect(mockWalletService.updateKeyPrice).toHaveBeenCalledWith({
        lockAddress: lock.address,
        keyPrice: '0.03',
      })
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('SIGN_DATA', () => {
    it("should handle SIGN_DATA by calling walletService's signDataPersonal", () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = {
        type: SIGN_DATA,
        data: 'neat',
        id: 'track this signature',
      }

      mockWalletService.signDataPersonal = jest
        .fn()
        .mockImplementation(() => Promise.resolve())
      mockWalletService.ready = true

      invoke(action)
      expect(mockWalletService.signDataPersonal).toHaveBeenCalledWith(
        '',
        'neat',
        expect.any(Function)
      )

      expect(next).toHaveBeenCalledWith(action)
    })

    it('should dispatch an error if the error param in the callback is defined', () => {
      expect.assertions(1)
      const { invoke, store } = create()
      const action = { type: SIGN_DATA, data: 'neat' }

      mockWalletService.signDataPersonal = jest
        .fn()
        .mockImplementation((_address, _data, callback) =>
          callback(new Error('an error'), undefined)
        )
      mockWalletService.ready = true

      invoke(action)

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error/SET_ERROR',
        })
      )
    })

    it('should dispatch some typed data if there is no error', () => {
      expect.assertions(1)
      const { invoke, store } = create()
      const action = {
        type: SIGN_DATA,
        data: 'neat',
        id: 'track this signature',
      }

      mockWalletService.signDataPersonal = jest
        .fn()
        .mockImplementation((_address, _data, callback) =>
          callback(undefined, 'here is your signature')
        )
      mockWalletService.ready = true

      invoke(action)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: 'signature/SIGNED_DATA',
        data: 'neat',
        signature: 'here is your signature',
        id: 'track this signature',
      })
    })
  })

  describe('SIGN_BULK_METADATA_REQUEST', () => {
    const action = {
      type: SIGN_BULK_METADATA_REQUEST,
      lockAddress: '0xe29ec42F0b620b1c9A716f79A02E9DC5A5f5F98a',
      owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      timestamp: 1234567890,
    }

    const expectedTypedData = expect.objectContaining({
      primaryType: 'KeyMetadata',
    })

    it("should handle SIGN_BULK_METADATA_REQUEST by calling walletService's signData", () => {
      expect.assertions(2)
      const { invoke, store } = create()

      mockWalletService.signData = jest.fn()
      mockWalletService.ready = true

      invoke(action)

      expect(store.dispatch).toHaveBeenCalledWith(waitForWallet())

      expect(mockWalletService.signData).toHaveBeenCalledWith(
        action.owner,
        expectedTypedData,
        expect.any(Function)
      )
    })

    it('should dispatch some typed data on success', () => {
      expect.assertions(3)
      const { invoke, store } = create()

      mockWalletService.signData = jest
        .fn()
        .mockImplementation((_address, _data, callback) => {
          callback(undefined, 'a signature')
        })
      mockWalletService.ready = true

      invoke(action)

      expect(store.dispatch).toHaveBeenNthCalledWith(1, waitForWallet())
      expect(store.dispatch).toHaveBeenNthCalledWith(2, dismissWalletCheck())

      expect(store.dispatch).toHaveBeenNthCalledWith(3, {
        type: SIGN_BULK_METADATA_RESPONSE,
        data: expectedTypedData,
        signature: 'a signature',
        lockAddress: action.lockAddress,
        keyIds: action.keyIds,
      })
    })

    it('should dispatch an error on failure', () => {
      expect.assertions(1)
      const { invoke, store } = create()

      mockWalletService.signData = jest
        .fn()
        .mockImplementation((_address, _data, callback) => {
          callback(new Error('it broke'), undefined)
        })
      mockWalletService.ready = true

      invoke(action)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_ERROR,
        error: {
          kind: 'Wallet',
          level: 'Warning',
          message: 'Could not sign typed data for metadata request.',
        },
      })
    })
  })
})
