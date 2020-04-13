import providerMiddleware, {
  changePassword,
  initializeUnlockProvider,
} from '../../middlewares/providerMiddleware'

import { setError } from '../../actions/error'
import { LogIn } from '../../utils/Error'
import {
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  SIGN_USER_DATA,
  SIGN_PAYMENT_DATA,
  SIGN_PURCHASE_DATA,
  SIGN_ACCOUNT_EJECTION,
  signUserData,
} from '../../actions/user'
import * as accountUtils from '../../utils/accounts'
import { resetRecoveryPhrase } from '../../actions/recovery'
import { EncryptedPrivateKey } from '../../unlockTypes'

jest.mock('../../utils/accounts')

const config = {
  readOnlyProvider: '',
  requiredNetworkId: '',
}

let dispatch: () => any

let mockProvider = {
  isUnlock: true,
  signUserData: jest.fn(() => ({ data: {}, sig: {} })),
  signPaymentData: jest.fn(() => ({ data: {}, sig: {} })),
  signKeyPurchaseRequestData: jest.fn(() => ({ data: {}, sig: {} })),
  generateSignedEjectionRequest: jest.fn(() => ({ data: {}, sig: {} })),
}

const getProvider = jest.fn(() => {
  return mockProvider
})
const setProvider = jest.fn(() => {})

describe('provider middleware', () => {
  beforeEach(() => {
    mockProvider = {
      isUnlock: true,
      signUserData: jest.fn(() => ({ data: {}, sig: {} })),
      signPaymentData: jest.fn(() => ({ data: {}, sig: {} })),
      signKeyPurchaseRequestData: jest.fn(() => ({ data: {}, sig: {} })),
      generateSignedEjectionRequest: jest.fn(() => ({ data: {}, sig: {} })),
    }
    dispatch = jest.fn()
  })

  describe('initializeUnlockProvider', () => {
    const emailAddress = 'test@us.er'
    const password = 'guest'
    const key: any = {}
    const address: string = 'address'

    it('should dispatch an error if it cannot decrypt', async () => {
      expect.assertions(1)
      const action = {
        type: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
        key,
        emailAddress,
        password,
      }
      const unlockProvider = {
        connect: jest.fn().mockRejectedValue(false),
        wallet: {
          address,
        },
      }
      const dispatch = jest.fn()
      await initializeUnlockProvider(action, unlockProvider, dispatch)
      expect(dispatch).toHaveBeenCalledWith(
        setError(
          LogIn.Warning(
            'Failed to decrypt private key. Check your password and try again.'
          )
        )
      )
    })
  })

  describe('SIGN_USER_DATA', () => {
    it('should call UnlockProvider', () => {
      expect.assertions(1)
      const next = () => {
        expect(mockProvider.signUserData).toHaveBeenCalled()
      }

      providerMiddleware(
        config,
        getProvider,
        setProvider
      )({
        getState: () => ({ provider: 'UNLOCK' }),
        dispatch,
      })(next)({
        type: SIGN_USER_DATA,
        data: {},
      })
    })
  })

  describe('SIGN_PAYMENT_DATA', () => {
    it('should call UnlockProvider', () => {
      expect.assertions(1)
      const next = () => {
        expect(mockProvider.signPaymentData).toHaveBeenCalledWith(
          'tok_1EPsocIsiZS2oQBMRXzw21xh'
        )
      }

      providerMiddleware(
        config,
        getProvider,
        setProvider
      )({
        getState: () => ({ provider: 'UNLOCK' }),
        dispatch,
      })(next)({
        type: SIGN_PAYMENT_DATA,
        stripeTokenId: 'tok_1EPsocIsiZS2oQBMRXzw21xh',
      })
    })
  })

  describe('SIGN_PURCHASE_DATA', () => {
    it('should call UnlockProvider', () => {
      expect.assertions(1)
      const data = {
        recipient: '0x123abc',
        lock: '0x321cba',
      }
      const next = () => {
        expect(mockProvider.signKeyPurchaseRequestData).toHaveBeenCalledWith(
          data
        )
      }

      providerMiddleware(
        config,
        getProvider,
        setProvider
      )({
        getState: () => ({ provider: 'UNLOCK' }),
        dispatch,
      })(next)({
        type: SIGN_PURCHASE_DATA,
        data,
      })
    })
  })

  describe('SIGN_ACCOUNT_EJECTION', () => {
    it('should call UnlockProvider', () => {
      expect.assertions(1)

      const next = () => {
        expect(
          mockProvider.generateSignedEjectionRequest
        ).toHaveBeenCalledWith()
      }

      providerMiddleware(
        config,
        getProvider,
        setProvider
      )({
        getState: () => ({ provider: 'UNLOCK' }),
        dispatch,
      })(next)({
        type: SIGN_ACCOUNT_EJECTION,
      })
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

      await changePassword({
        oldPassword,
        newPassword: 'visitor',
        passwordEncryptedPrivateKey: encryptedPrivateKey,
        dispatch,
      })

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SIGN_USER_DATA,
        })
      )
    })
  })
})

describe('changePassword', () => {
  const oldPassword = 'oldPassword'
  const newPassword = 'newPassword'
  const passwordEncryptedPrivateKey: EncryptedPrivateKey = {
    version: 1,
  }
  const newEncryptedKey: EncryptedPrivateKey = {
    version: 1,
  }
  const dispatch = jest.fn()

  describe('success', () => {
    beforeEach(async () => {
      ;(accountUtils as any).reEncryptPrivateKey = jest.fn(() =>
        Promise.resolve(newEncryptedKey)
      )
      await changePassword({
        oldPassword,
        newPassword,
        passwordEncryptedPrivateKey,
        dispatch,
      })
    })

    it('should reEncryptPrivateKey', () => {
      expect.assertions(1)
      expect(accountUtils.reEncryptPrivateKey).toHaveBeenCalledWith(
        passwordEncryptedPrivateKey,
        oldPassword,
        newPassword
      )
    })

    it('should dispatch signUserData', () => {
      expect.assertions(1)
      const expectedAction = signUserData({
        passwordEncryptedPrivateKey: newEncryptedKey,
      })
      expect(dispatch).toHaveBeenCalledWith(expectedAction)
    })

    it('should dispatch resetRecoveryPhrase', () => {
      expect.assertions(1)
      const expectedAction = resetRecoveryPhrase()
      expect(dispatch).toHaveBeenCalledWith(expectedAction)
    })
  })

  it('should dispatch a warning when the private could not be re-encrypted', async () => {
    expect.assertions(1)
    ;(accountUtils as any).reEncryptPrivateKey = jest.fn(() =>
      Promise.reject('failed to decrypt key')
    )
    await changePassword({
      oldPassword,
      newPassword,
      passwordEncryptedPrivateKey,
      dispatch,
    })
    const expectedAction = setError(
      LogIn.Warning('Could not re-encrypt private key -- bad password?')
    )
    expect(dispatch).toHaveBeenCalledWith(expectedAction)
  })
})
