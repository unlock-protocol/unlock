import { EventEmitter } from 'events'
import * as accountUtils from '../../utils/accounts'
import storageMiddleware from '../../middlewares/storageMiddleware'
import { addTransaction, NEW_TRANSACTION } from '../../actions/transaction'
import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../../actions/accounts'
import { startLoading, doneLoading } from '../../actions/loading'
import { gotRecoveryPhrase } from '../../actions/recovery'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  setEncryptedPrivateKey,
  SIGNED_USER_DATA,
  SIGNED_PAYMENT_DATA,
  GET_STORED_PAYMENT_DETAILS,
  SIGNED_PURCHASE_DATA,
  KEY_PURCHASE_INITIATED,
  WELCOME_EMAIL,
  gotEncryptedPrivateKeyPayload,
  SET_ENCRYPTED_PRIVATE_KEY,
  SIGNED_ACCOUNT_EJECTION,
} from '../../actions/user'
import { success, failure } from '../../services/storageService'
import { Storage } from '../../utils/Error'
import { setError, SET_ERROR } from '../../actions/error'
import { ADD_TO_CART, UPDATE_PRICE } from '../../actions/keyPurchase'
import UnlockUser from '../../structured_data/unlockUser'

jest.mock('../../utils/accounts')

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */

let state
let account
let lock
let network

const create = () => {
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()
  const handler = storageMiddleware(mockStorageService)(store)
  const invoke = action => handler(next)(action)
  return { next, invoke, store }
}

class MockStorageService extends EventEmitter {
  constructor() {
    super()
  }
}

let mockStorageService = new MockStorageService()
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

      mockStorageService.getRecentTransactionsHashesSentBy = jest.fn()

      invoke(action)
      expect(store.dispatch).toHaveBeenCalledWith(startLoading())
      expect(
        mockStorageService.getRecentTransactionsHashesSentBy
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

  describe('handling SIGNED_ACCOUNT_EJECTION', () => {
    it('should call storageService to eject the user', () => {
      expect.assertions(2)
      const publicKey = '0x123'
      const data = {
        message: {
          user: {
            publicKey,
          },
        },
      }
      const sig = ''
      const { next, invoke } = create()
      const action = { type: SIGNED_ACCOUNT_EJECTION, data, sig }
      mockStorageService.ejectUser = jest.fn()

      invoke(action)
      expect(mockStorageService.ejectUser).toHaveBeenCalledWith(
        publicKey,
        data,
        sig
      )
      expect(next).toHaveBeenCalledTimes(1)
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
    const password = 'password'
    const passwordEncryptedPrivateKey = {}
    const emailAddress = 'tim@cern.ch'
    const publicKey = '0xabc'
    const accountInfo = { address: publicKey, passwordEncryptedPrivateKey }
    const user = {}

    beforeEach(() => {
      accountUtils.createAccountAndPasswordEncryptKey = jest.fn(() =>
        Promise.resolve(accountInfo)
      )
      UnlockUser.build = jest.fn(() => user)
    })

    it('should call storageService with the right object', async () => {
      expect.assertions(3)
      const { next, invoke } = create()

      const action = {
        type: SIGNUP_CREDENTIALS,
        emailAddress,
        password,
      }

      mockStorageService.createUser = jest.fn()

      await invoke(action)
      expect(UnlockUser.build).toHaveBeenCalledWith({
        emailAddress,
        publicKey,
        passwordEncryptedPrivateKey,
      })
      expect(mockStorageService.createUser).toHaveBeenCalledWith(
        user,
        emailAddress,
        password
      )
      expect(next).toHaveBeenCalledTimes(1)
    })

    describe('success', () => {
      it('should dispatch setEncryptedPrivateKey, gotEncryptedPrivateKeyPayload, and welcomeEmail after an account is created', async () => {
        expect.assertions(3)
        const { store } = create()

        const passwordEncryptedPrivateKey = {
          id: 'this is the encrypted key',
        }
        const emailAddress = 'paul@bunyan.io'
        const password = 'guest'
        const recoveryKey = {
          recovery: 'key',
        }

        accountUtils.reEncryptPrivateKey = jest.fn(() => recoveryKey)

        await mockStorageService.emit(success.createUser, {
          passwordEncryptedPrivateKey,
          emailAddress,
          password,
        })

        expect(store.dispatch).toHaveBeenNthCalledWith(3, {
          type: SET_ENCRYPTED_PRIVATE_KEY,
          key: passwordEncryptedPrivateKey,
          emailAddress,
        })
        expect(store.dispatch).toHaveBeenNthCalledWith(2, {
          type: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
          key: passwordEncryptedPrivateKey,
          emailAddress,
          password,
        })
        expect(store.dispatch).toHaveBeenNthCalledWith(1, {
          type: WELCOME_EMAIL,
          emailAddress,
          recoveryKey,
        })
      })
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

    it('should dispatch the payload when it can get an encrypted private key', () => {
      expect.assertions(5)
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
      expect(store.dispatch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
          key,
          emailAddress,
          password,
        })
      )
      expect(store.dispatch).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: SET_ENCRYPTED_PRIVATE_KEY,
          key,
          emailAddress,
        })
      )
      expect(store.dispatch).toHaveBeenCalledTimes(2)
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

      mockStorageService.emit(success.getKeyPrice, fees)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_PRICE,
        fees,
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

  describe('when starting on the recovery page', () => {
    const email = 'julien@unlock-protocol.com'
    const recoveryKey = {}
    const recoveryPhrase = 'recoveryPhrase'

    beforeEach(() => {
      state.router = {
        location: {
          pathname: '/recover/',
          search: `?email=${email}&recoveryKey=${JSON.stringify(recoveryKey)}`,
        },
      }
      mockStorageService = new MockStorageService()
      mockStorageService.getUserRecoveryPhrase = jest.fn()
    })

    it('should get the user recovery phrase', () => {
      expect.assertions(1)
      create()
      expect(mockStorageService.getUserRecoveryPhrase).toHaveBeenCalledWith(
        email
      )
    })

    describe('when the recovery phrase was successfully retrieved', () => {
      it('should dispatch gotRecoveryPhrase and gotEncryptedPrivateKeyPayload', () => {
        expect.assertions(2)
        const { store } = create()

        mockStorageService.emit(success.getUserRecoveryPhrase, {
          recoveryPhrase,
        })

        expect(store.dispatch).toHaveBeenNthCalledWith(
          1,
          gotRecoveryPhrase(recoveryPhrase)
        )
        expect(store.dispatch).toHaveBeenNthCalledWith(
          2,
          gotEncryptedPrivateKeyPayload(recoveryKey, email, recoveryPhrase)
        )
      })
    })

    describe('when the recovery phrase could not be retrieved', () => {
      it('should dispatch setError', () => {
        expect.assertions(1)
        const { store } = create()

        mockStorageService.emit(failure.getUserRecoveryPhrase, {
          recoveryPhrase,
        })

        expect(store.dispatch).toHaveBeenNthCalledWith(
          1,
          setError(Storage.Warning('Could not initiate account recovery.'))
        )
      })
    })
  })
})
