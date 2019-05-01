import {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
} from '@unlock-protocol/unlock-js'
import storageMiddleware from '../../middlewares/storageMiddleware'
import { UPDATE_LOCK, updateLock, UPDATE_LOCK_NAME } from '../../actions/lock'
import { STORE_LOCK_NAME } from '../../actions/storage'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SIGNED_DATA } from '../../actions/signature'
import UnlockLock from '../../structured_data/unlockLock'
import { startLoading, doneLoading } from '../../actions/loading'
import configure from '../../config'
import { SIGNUP_CREDENTIALS } from '../../actions/signUp'
import { LOGIN_CREDENTIALS } from '../../actions/login'

jest.mock('@unlock-protocol/unlock-js')

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */

let state
let account
let lock
let network

const create = () => {
  const config = configure()
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()
  const handler = storageMiddleware(config)(store)
  const invoke = action => handler(next)(action)
  return { next, invoke, store }
}

let mockStorageService = {}

jest.mock('../../services/storageService', () => {
  return function() {
    return mockStorageService
  }
})

jest.mock('../../structured_data/unlockLock.js')

describe('Storage middleware', () => {
  beforeEach(() => {
    account = {
      address: '0xabc',
    }
    network = {
      name: 1984,
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
    // reset the mock
    mockStorageService = {}
  })

  describe('handling NEW_TRANSACTION', () => {
    it('should store the transaction', async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const transaction = {
        hash: '0x123',
        to: 'unlock',
        from: 'julien',
        network: 1984,
      }
      const action = { type: NEW_TRANSACTION, transaction }

      mockStorageService.storeTransaction = jest.fn(() => {
        return Promise.resolve()
      })
      await invoke(action)
      expect(mockStorageService.storeTransaction).toHaveBeenCalledWith(
        transaction.hash,
        transaction.from,
        transaction.to,
        transaction.network
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling SET_ACCOUNT', () => {
    it('should retrieve the transactions for that user and only dispatch the ones which match the network', async () => {
      expect.assertions(6)
      const { next, invoke, store } = create()
      const account = {
        address: '0x123',
      }
      const action = { type: SET_ACCOUNT, account }

      mockStorageService.getTransactionsHashesSentBy = jest.fn(() => {
        return Promise.resolve([
          {
            hash: '0xabc',
            network: 1,
          },
          {
            hash: '0xdef',
            network: 1984,
          },
        ])
      })
      await invoke(action)

      expect(store.dispatch).toHaveBeenNthCalledWith(1, startLoading())
      expect(store.dispatch).toHaveBeenNthCalledWith(2, doneLoading())

      expect(
        mockStorageService.getTransactionsHashesSentBy
      ).toHaveBeenCalledWith(account.address)
      expect(
        mockStorageService.getTransactionsHashesSentBy
      ).toHaveBeenCalledWith(account.address)

      expect(store.dispatch).toHaveBeenNthCalledWith(
        3,
        addTransaction({
          hash: '0xdef',
          network: 1984,
        })
      )

      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling STORE_LOCK_NAME', () => {
    it("dispatches to the appropriate storage middleware handler to store the lock's name", async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: STORE_LOCK_NAME }
      mockStorageService.storeLockDetails = jest.fn(() => {
        return Promise.resolve()
      })
      await invoke(action)
      expect(mockStorageService.storeLockDetails).toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling UPDATE_LOCK', () => {
    describe('when the update is for a lock which already has a name', () => {
      it('calls the next middleware', async () => {
        expect.assertions(2)
        const { next, invoke } = create()
        const action = { type: UPDATE_LOCK, address: lock.address, update: {} }
        state.locks[lock.address].name = 'My lock'
        mockStorageService.lockLookUp = jest.fn(() => {})

        await invoke(action)
        expect(mockStorageService.lockLookUp).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the update is not a transaction', () => {
      it('dispatches to the appropriate storage middleware handler', async () => {
        expect.assertions(3)
        const { next, invoke, store } = create()
        const action = { type: UPDATE_LOCK, address: lock.address, update: {} }
        delete state.locks[lock.address].name
        mockStorageService.lockLookUp = jest.fn(() => {
          return Promise.resolve('A lock has no name')
        })
        await invoke(action)
        expect(mockStorageService.lockLookUp).toHaveBeenCalledWith(lock.address)
        expect(next).toHaveBeenCalledTimes(1)
        expect(store.dispatch).toHaveBeenCalledWith(
          updateLock(lock.address, { name: 'A lock has no name' })
        )
      })
    })
  })

  describe('handling SIGNED_DATA', () => {
    it('should not do anything if the signed message is not for a lock', () => {
      expect.assertions(2)
      const data = 'data'
      const signature = 'signature'
      const { next, invoke } = create()
      const action = { type: SIGNED_DATA, data, signature }
      mockStorageService.storeLockDetails = jest.fn()

      invoke(action)
      expect(mockStorageService.storeLockDetails).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should store the lock details if the signed message is for a lock', () => {
      expect.assertions(2)
      const data = {
        message: {
          lock: {},
        },
      }
      const signature = 'signature'
      const { next, invoke } = create()
      const action = { type: SIGNED_DATA, data, signature }
      mockStorageService.storeLockDetails = jest.fn(() => Promise.resolve())

      invoke(action)
      expect(mockStorageService.storeLockDetails).toHaveBeenCalledWith(
        data,
        signature
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('UPDATE_LOCK_NAME', () => {
    it('should dispatch an action to sign message to update the name of a lock', () => {
      expect.assertions(3)
      const lock = {
        address: '0x123',
        name: 'my lock',
        owner: '0xabc',
      }
      const data = {
        message: {
          lock: {},
        },
      }
      const newName = 'a new name'
      const { next, invoke, store } = create()
      state.locks[lock.address] = lock

      const action = {
        type: UPDATE_LOCK_NAME,
        address: lock.address,
        name: newName,
      }
      UnlockLock.build = jest.fn(() => data)
      invoke(action)
      expect(UnlockLock.build).toHaveBeenCalledWith({
        name: action.name,
        owner: lock.owner,
        address: lock.address,
      })

      expect(next).toHaveBeenCalledTimes(1)
      expect(store.dispatch).toHaveBeenCalledWith({
        data,
        type: 'signature/SIGN_DATA',
      })
    })
  })

  describe('SIGNUP_CREDENTIALS', () => {
    it('should create a user and then set the account', () => {
      expect.assertions(2)
      createAccountAndPasswordEncryptKey.mockReturnValue({
        address: '',
        passwordEncryptedPrivateKey: '',
      })
      const emailAddress = 'tim@cern.ch'
      const password = 'guest'
      const { next, invoke } = create()

      const action = {
        type: SIGNUP_CREDENTIALS,
        emailAddress,
        password,
      }

      mockStorageService.createUser = jest.fn(() => Promise.resolve(true))

      invoke(action)
      expect(mockStorageService.createUser).toHaveBeenCalled()
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('LOGIN_CREDENTIALS', () => {
    it('Should call getAccountFromPrivateKey with correct data', async () => {
      expect.assertions(3)
      const emailAddress = 'tim@cern.ch'
      const password = 'guest'
      const { next, invoke } = create()

      const action = {
        type: LOGIN_CREDENTIALS,
        emailAddress,
        password,
      }

      mockStorageService.getUserPrivateKey = jest.fn(() => {
        return Promise.resolve({
          data: {
            passwordEncryptedPrivateKey: 'Private Key reporting for duty',
          },
        })
      })

      await invoke(action)
      expect(mockStorageService.getUserPrivateKey).toHaveBeenCalledWith(
        emailAddress
      )
      expect(getAccountFromPrivateKey).toHaveBeenCalledWith(
        'Private Key reporting for duty',
        'guest'
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
