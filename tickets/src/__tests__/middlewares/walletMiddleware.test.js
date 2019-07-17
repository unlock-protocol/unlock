import EventEmitter from 'events'
import walletMiddleware from '../../middlewares/walletMiddleware'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { PROVIDER_READY } from '../../actions/provider'
import { PURCHASE_KEY } from '../../actions/key'
import { SET_ERROR } from '../../actions/error'
import { POLLING_INTERVAL } from '../../constants'
import { FATAL_NON_DEPLOYED_CONTRACT, FATAL_WRONG_NETWORK } from '../../errors'
import { SIGN_ADDRESS, gotSignedAddress } from '../../actions/ticket'
import {
  DISMISS_CHECK,
  GOT_WALLET,
  WAIT_FOR_WALLET,
} from '../../actions/walletStatus'
import { NEW_TRANSACTION } from '../../actions/transaction'
import UnlockEventRSVP from '../../structured_data/unlockEventRSVP'

let mockConfig

jest.mock('../../config', () => () => mockConfig)

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

const network = {
  name: 'test',
}

const transaction = {
  hash: '0xf21e9820af34282c8bebb3a191cf615076ca06026a144c9c28e9cb762585472e',
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
  signData() {}
}

jest.useFakeTimers()

jest.mock('@unlock-protocol/unlock-js', () => {
  const mockUnlock = require.requireActual('@unlock-protocol/unlock-js') // Original module
  return {
    ...mockUnlock,
    WalletService: function() {
      return mockWalletService
    },
  }
})

let mockWalletService

describe('Wallet middleware', () => {
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

  afterEach(() => {
    jest.resetAllMocks()
  })

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
              error: FATAL_WRONG_NETWORK,
              data: {
                currentNetwork: 'Winston',
                requiredNetworkId: 1984,
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
            error: error.message,
            data: {},
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
            data: {},
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

  it('should handle SIGN_ADDRESS and emit a signed address', () => {
    expect.assertions(3)
    const {
      next,
      invoke,
      store: { dispatch, getState },
    } = create()
    const address = '0x12345678'
    const action = {
      type: SIGN_ADDRESS,
      address,
    }

    const data = UnlockEventRSVP.build({
      publicKey: account.address,
      eventAddress: address,
    })
    mockWalletService.signDataPersonal = jest.fn((_, address, cb) =>
      cb(null, `ENCRYPTED: ${JSON.stringify(address)}`)
    )
    invoke(action)
    expect(mockWalletService.signDataPersonal).toHaveBeenCalledWith(
      getState().account.address,
      JSON.stringify(data),
      expect.any(Function)
    )
    expect(dispatch).toHaveBeenCalledWith(
      gotSignedAddress(
        address,
        `ENCRYPTED: ${JSON.stringify(JSON.stringify(data))}`
      )
    )
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('PURCHASE_KEY', () => {
    it('should call purchaseKey on the walletService with the right values', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      state.locks = {
        '0xLock': {
          keyPrice: '0.01',
          currencyContractAddress: '0xERC20Contract',
          address: '0xLock',
        },
      }
      const action = {
        type: PURCHASE_KEY,
        key: {
          lock: '0xLock',
          owner: '0xOwner',
        },
      }
      mockWalletService.purchaseKey = jest.fn()
      invoke(action)
      expect(mockWalletService.purchaseKey).toHaveBeenCalledWith(
        action.key.lock,
        action.key.owner,
        state.locks['0xLock'].keyPrice,
        null,
        null,
        state.locks['0xLock'].currencyContractAddress
      )
      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
