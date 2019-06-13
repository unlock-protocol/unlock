import { EventEmitter } from 'events'
import { createAccountAndPasswordEncryptKey } from '@unlock-protocol/unlock-js'
import storageMiddleware, {
  changePassword,
} from '../../middlewares/storageMiddleware'
import { UPDATE_LOCK, updateLock } from '../../actions/lock'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT, setAccount } from '../../actions/accounts'
import { startLoading, doneLoading } from '../../actions/loading'
import configure from '../../config'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  setEncryptedPrivateKey,
  SIGN_USER_DATA,
  SIGNED_USER_DATA,
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
      userDetails: {
        email: 'johnny@quest.biz',
      },
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

  describe('handling SIGNED_USER_DATA', () => {
    it('should call storageService for user updates', () => {
      expect.assertions(2)
      const emailAddress = 'geoff@bitconnect.gov'
      const data = {
        message: {
          user: {
            emailAddress,
          },
        },
      }
      const sig = {}
      const { next, invoke } = create()
      const action = { type: SIGNED_USER_DATA, data, sig }
      mockStorageService.updateUserEncryptedPrivateKey = jest.fn()

      invoke(action)
      expect(
        mockStorageService.updateUserEncryptedPrivateKey
      ).toHaveBeenCalledWith(emailAddress, data, sig)
      expect(next).toHaveBeenCalledTimes(1)
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

  describe('CHANGE_PASSWORD', () => {
    const encryptedPrivateKey = {
      version: 3,
      id: 'edbe0942-593b-4027-8688-07b7d3ec56c5',
      address: '0272742cbe9b4d4c81cffe8dfc0c33b5fb8893e5',
      crypto: {
        ciphertext:
          '6f2a3ed499a2962cc48e6f7f0a90a0c817c83024cc4878f624ad251fccd0b706',
        cipherparams: { iv: '69f031944591eed34c4d4f5841d283b0' },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          salt:
            '5ac866336768f9613a505acd18dab463f4d10152ffefba5772125f5807539c36',
          n: 8192,
          r: 8,
          p: 1,
        },
        mac: 'cc8efad3b534336ecffc0dbf6f51fd558301873d322edc6cbc1c9398ee0953ec',
      },
    }
    const oldPassword = 'guest'

    it('should dispatch a new user object to be signed', async () => {
      expect.assertions(1)
      const dispatch = jest.fn()
      const emailAddress = 'zapp@brannigan.io'
      const storageService = {
        getUserPrivateKey: async () => {
          return encryptedPrivateKey
        },
      }

      await changePassword({
        oldPassword,
        newPassword: 'visitor',
        emailAddress,
        storageService,
        dispatch,
      })

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SIGN_USER_DATA,
        })
      )
    })
  })

  describe('updateUser', () => {
    it('always dispatches new user details on success', () => {
      expect.assertions(1)
      const { store } = create()

      const user = {
        passwordEncryptedPrivateKey: 'BEGIN ROT13 DATA ===',
      }
      const emailAddress = 'race@bannon.io'

      mockStorageService.emit(success.updateUser, { user, emailAddress })

      expect(store.dispatch).toHaveBeenCalledWith(
        setEncryptedPrivateKey(user.passwordEncryptedPrivateKey, emailAddress)
      )
    })

    it('should dispatch a storageError on failure', () => {
      expect.assertions(1)
      const { store } = create()

      const error = 'not enough vespene gas.'
      mockStorageService.emit(failure.updateUser, { error })

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            kind: 'Storage',
            level: 'Warning',
          }),
        })
      )
    })
  })
})
