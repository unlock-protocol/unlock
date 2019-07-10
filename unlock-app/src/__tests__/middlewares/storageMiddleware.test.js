import { EventEmitter } from 'events'
import { createAccountAndPasswordEncryptKey } from '@unlock-protocol/unlock-js'
import storageMiddleware, {
  changePassword,
} from '../../middlewares/storageMiddleware'
import { UPDATE_LOCK, updateLock, getLock } from '../../actions/lock'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT, setAccount, UPDATE_ACCOUNT } from '../../actions/accounts'
import { startLoading, doneLoading } from '../../actions/loading'
import configure from '../../config'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  setEncryptedPrivateKey,
  SIGN_USER_DATA,
  SIGNED_USER_DATA,
  SIGNED_PAYMENT_DATA,
  GET_STORED_PAYMENT_DETAILS,
  SIGNED_PURCHASE_DATA,
  KEY_PURCHASE_INITIATED,
} from '../../actions/user'
import { success, failure } from '../../services/storageService'
import Error from '../../utils/Error'
import { setError, SET_ERROR } from '../../actions/error'
import { ADD_TO_CART, UPDATE_PRICE } from '../../actions/keyPurchase'

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
    it('should get the transaction for that user with storageService', () => {
      expect.assertions(3)
      const { next, invoke, store } = create()
      const account = {
        address: '0x123',
      }
      const action = { type: SET_ACCOUNT, account }

      mockStorageService.getTransactionsHashesSentBy = jest.fn()
      mockStorageService.getLockAddressesForUser = jest.fn()

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

    it('should get the locks for that user from the storageService', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const account = {
        address: '0x123',
      }
      const action = { type: SET_ACCOUNT, account }

      mockStorageService.getLockAddressesForUser = jest.fn()
      mockStorageService.getTransactionsHashesSentBy = jest.fn()

      invoke(action)
      expect(mockStorageService.getLockAddressesForUser).toHaveBeenCalledWith(
        account.address
      )
      expect(next).toHaveBeenCalledTimes(1)
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

  describe('handling SIGNED_PAYMENT_DATA', () => {
    it('should call storageService for payment method updates', () => {
      expect.assertions(2)
      const emailAddress = 'leif.erikson@vinland.saga'
      const data = {
        message: {
          user: {
            emailAddress,
          },
        },
      }
      const sig = {}
      const { next, invoke } = create()
      const action = { type: SIGNED_PAYMENT_DATA, data, sig }
      mockStorageService.addPaymentMethod = jest.fn()

      invoke(action)
      expect(mockStorageService.addPaymentMethod).toHaveBeenCalledWith(
        emailAddress,
        data,
        sig
      )
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should refresh the state after a method is added', () => {
      expect.assertions(1)
      // need to initialize the mocks even though we don't use return value of
      // create()
      create()
      mockStorageService.getCards = jest.fn()

      mockStorageService.emit(success.addPaymentMethod, {
        emailAddress: 'user@email.internet',
      })

      expect(mockStorageService.getCards).toHaveBeenCalledWith(
        'user@email.internet'
      )
    })

    it('should dispatch a warning if payment method cannot be added', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(failure.addPaymentMethod)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_ERROR,
        error: {
          kind: 'Storage',
          level: 'Warning',
          message: 'Could not add payment method.',
        },
      })
    })
  })

  describe('handling SIGNED_PURCHASE_DATA', () => {
    it('should call storageService to request a key purchase', () => {
      expect.assertions(2)
      const data = {}
      const sig = 'a signature'
      const { next, invoke } = create()
      const action = { type: SIGNED_PURCHASE_DATA, data, sig }
      mockStorageService.purchaseKey = jest.fn()

      invoke(action)
      // At present, signatures sent to the backend are base64'd
      expect(mockStorageService.purchaseKey).toHaveBeenCalledWith(
        data,
        'YSBzaWduYXR1cmU='
      )
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should signal the paywall after a successful key purchase', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(success.keyPurchase)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: KEY_PURCHASE_INITIATED,
      })
    })

    it('should dispatch a warning if the key purchase is not successful', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(failure.keyPurchase)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_ERROR,
        error: {
          kind: 'Storage',
          level: 'Warning',
          message: 'Could not initiate key purchase.',
        },
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

  describe('GET_STORED_PAYMENT_DETAILS', () => {
    it('should call storageService', () => {
      expect.assertions(1)
      const { invoke } = create()
      const action = {
        type: GET_STORED_PAYMENT_DETAILS,
        emailAddress: 'name@domain.com',
      }
      mockStorageService.getCards = jest.fn()
      invoke(action)

      expect(mockStorageService.getCards).toHaveBeenCalledWith(
        'name@domain.com'
      )
    })

    it('should handle success.getCards when a user has payment methods', () => {
      expect.assertions(1)
      const { store } = create()
      const cards = [{ id: 'I am a card' }]
      mockStorageService.emit(success.getCards, cards)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_ACCOUNT,
        update: {
          cards,
        },
      })
    })

    it('should do nothing with success.getCards when a user has no payment methods', () => {
      expect.assertions(1)
      const { store } = create()
      const cards = []
      mockStorageService.emit(success.getCards, cards)

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('getLockAddressesForUser', () => {
    it('should handle success', () => {
      expect.assertions(2)
      const { store } = create()
      const addresses = ['0x123', '0x456']

      mockStorageService.emit(success.getLockAddressesForUser, addresses)

      addresses.forEach(address => {
        expect(store.dispatch).toHaveBeenCalledWith(getLock(address))
      })
    })
  })

  describe('ADD_TO_CART', () => {
    it('should get the key price', () => {
      expect.assertions(1)
      const { invoke } = create()
      const action = {
        type: ADD_TO_CART,
        lock: {
          address: '0x123abc',
        },
      }

      mockStorageService.getKeyPrice = jest.fn()
      invoke(action)

      expect(mockStorageService.getKeyPrice).toHaveBeenCalledWith('0x123abc')
    })
  })

  describe('getKeyPrice', () => {
    it('should handle success', () => {
      expect.assertions(1)
      const { store } = create()
      const fees = {
        creditCardProcessing: 450,
        gasFee: 30,
        keyPrice: 100,
        unlockServiceFee: 20,
      }
      const price = 600

      mockStorageService.emit(success.getKeyPrice, fees)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_PRICE,
        price,
      })
    })

    it('should handle failure', () => {
      expect.assertions(1)
      const { store } = create()

      mockStorageService.emit(
        failure.getKeyPrice,
        'could not communicate with server'
      )

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_ERROR,
        error: {
          kind: 'Storage',
          level: 'Warning',
          message: 'Unable to get dollar-denominated key price from server.',
        },
      })
    })
  })
})
