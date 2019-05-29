import { EventEmitter } from 'events'
import { createAccountAndPasswordEncryptKey } from '@unlock-protocol/unlock-js'
import storageMiddleware from '../../middlewares/storageMiddleware'
import { UPDATE_LOCK, updateLock, UPDATE_LOCK_NAME } from '../../actions/lock'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT, setAccount } from '../../actions/accounts'
import { SIGNED_DATA } from '../../actions/signature'
import UnlockLock from '../../structured_data/unlockLock'
import { startLoading, doneLoading } from '../../actions/loading'
import configure from '../../config'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
} from '../../actions/user'
import { success, failure } from '../../services/storageService'
import Error from '../../utils/Error'
import { setError } from '../../actions/error'

const { Storage } = Error

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

class MockStorageService extends EventEmitter {
  constructor() {
    super()
  }
}

let mockStorageService = new MockStorageService()

jest.mock('../../services/storageService', () => {
  const actual = require.requireActual('../../services/storageService')
  return {
    ...actual,
    StorageService: function() {
      return mockStorageService
    },
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
    mockStorageService = new MockStorageService()
  })

  describe('handling NEW_TRANSACTION', () => {
    it('should call storageService', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const transaction = {
        hash: '0x123',
        to: 'unlock',
        from: 'julien',
        network: 1984,
      }
      const action = { type: NEW_TRANSACTION, transaction }

      mockStorageService.storeTransaction = jest.fn()

      invoke(action)
      expect(mockStorageService.storeTransaction).toHaveBeenCalledWith(
        transaction.hash,
        transaction.from,
        transaction.to,
        transaction.network
      )
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should handle failure.storeTransaction events', () => {
      expect.assertions(1)
      const { store } = create()
      mockStorageService.emit(failure.storeTransaction, 'No storage for you.')

      expect(store.dispatch).toHaveBeenCalledWith(
        setError(Storage.Diagnostic('Failed to store transaction.'))
      )
    })
  })

  describe('handling SET_ACCOUNT', () => {
    it('should call storageService', () => {
      expect.assertions(3)
      const { next, invoke, store } = create()
      const account = {
        address: '0x123',
      }
      const action = { type: SET_ACCOUNT, account }

      mockStorageService.getTransactionsHashesSentBy = jest.fn()

      invoke(action)
      expect(store.dispatch).toHaveBeenCalledWith(startLoading())
      expect(
        mockStorageService.getTransactionsHashesSentBy
      ).toHaveBeenCalledWith(account.address)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should retrieve the transactions for that user and only dispatch the ones which match the network', () => {
      expect.assertions(2)
      const { store } = create()
      const senderAddress = '0x123'
      const hashes = [
        {
          hash: '0xabc',
          network: 1,
        },
        {
          hash: '0xdef',
          network: 1984,
        },
      ]

      mockStorageService.emit(success.getTransactionHashesSentBy, {
        senderAddress,
        hashes,
      })

      expect(store.dispatch).toHaveBeenNthCalledWith(
        1,
        addTransaction(hashes[1])
      )
      expect(store.dispatch).toHaveBeenNthCalledWith(2, doneLoading())
    })

    it('should handle failure events', () => {
      expect.assertions(2)
      const { store } = create()

      mockStorageService.emit(
        failure.getTransactionHashesSentBy,
        'API On Vacation'
      )

      expect(store.dispatch).toHaveBeenNthCalledWith(
        1,
        setError(Storage.Diagnostic('getTransactionHashesSentBy failed.'))
      )
      expect(store.dispatch).toHaveBeenNthCalledWith(2, doneLoading())
    })
  })

  describe('handling UPDATE_LOCK', () => {
    it('should call storageService', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: UPDATE_LOCK, address: lock.address, update: {} }
      delete state.locks[lock.address].name

      mockStorageService.lockLookUp = jest.fn()
      invoke(action)
      expect(mockStorageService.lockLookUp).toHaveBeenCalledWith(lock.address)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should get the name and pass it on', () => {
      expect.assertions(1)
      const { store } = create()
      const address = '0x123'
      const name =
        'Shirley, Shirley Bo-ber-ley, bo-na-na fanna Fo-fer-ley. fee fi mo-mer-ley, Shirley!'

      mockStorageService.emit(success.lockLookUp, { address, name })

      expect(store.dispatch).toHaveBeenCalledWith(updateLock(address, { name }))
    })

    it('should handle failure events', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(failure.lockLookUp, 'Not enough vespene gas.')

      expect(store.dispatch).toHaveBeenCalledWith(
        setError(Storage.Diagnostic('Could not look up lock details.'))
      )
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

    it('should call storageService', () => {
      expect.assertions(2)
      const data = {
        message: {
          lock: {},
        },
      }
      const signature = 'signature'
      const { next, invoke } = create()
      const action = { type: SIGNED_DATA, data, signature }
      mockStorageService.storeLockDetails = jest.fn()

      invoke(action)
      expect(mockStorageService.storeLockDetails).toHaveBeenCalledWith(
        data,
        signature
      )
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should handle failure events', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(failure.storeLockDetails, {
        address: '0x123',
        error: 'Not enough vespene gas.',
      })

      expect(store.dispatch).toHaveBeenCalledWith(
        setError(Storage.Warning('Could not store some lock metadata.'))
      )
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
    it('should call storageService', done => {
      expect.assertions(4)
      const emailAddress = 'tim@cern.ch'
      const password = 'guest'
      const { next, invoke } = create()

      const action = {
        type: SIGNUP_CREDENTIALS,
        emailAddress,
        password,
      }

      mockStorageService.createUser = user => {
        // These properties will be undefined if async call is used incorrectly.
        const {
          emailAddress,
          publicKey,
          passwordEncryptedPrivateKey,
        } = user.message.user
        expect(emailAddress).toBeDefined()
        expect(publicKey).toBeDefined()
        expect(passwordEncryptedPrivateKey).toBeDefined()
        done()
      }

      invoke(action)

      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should dispatch setAccount when an account is created', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(success.createUser, '0x123abc')

      expect(store.dispatch).toHaveBeenCalledWith(
        setAccount({ address: '0x123abc' })
      )
    })

    it('should dispatch an error when user creation fails', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(
        failure.createUser,
        "I don't really feel like it."
      )

      expect(store.dispatch).toHaveBeenCalledWith(
        setError(Storage.Warning('Could not create this user account.'))
      )
    })
  })

  describe('LOGIN_CREDENTIALS', () => {
    const emailAddress = 'tim@cern.ch'
    const password = 'guest'
    let key
    beforeEach(async () => {
      const info = await createAccountAndPasswordEncryptKey(password)
      key = info.passwordEncryptedPrivateKey
    })
    it('should dispatch the payload when it can get an encrypted private key', () => {
      expect.assertions(4)
      const { next, invoke, store } = create()

      const action = {
        type: LOGIN_CREDENTIALS,
        emailAddress,
        password,
      }

      mockStorageService.getUserPrivateKey = jest.fn(() => ({
        then: fn => fn(key),
      }))

      invoke(action)
      expect(mockStorageService.getUserPrivateKey).toHaveBeenCalled()
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
          key,
          emailAddress,
          password,
        })
      )
      expect(store.dispatch).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it("should dispatch a storageError when it doesn't", () => {
      expect.assertions(2)
      const { store } = create()

      const errorMessage = "I haven't got that key."

      mockStorageService.emit(failure.getUserPrivateKey, {
        error: errorMessage,
      })

      expect(store.dispatch).toHaveBeenCalledWith(
        setError(Storage.Warning('Could not find this user account.'))
      )
      expect(store.dispatch).toHaveBeenCalledTimes(1)
    })
  })
})
