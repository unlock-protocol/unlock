import * as unlockJs from '@unlock-protocol/unlock-js'

import providerMiddleware, {
  changePassword,
  initializeUnlockProvider,
  sendMethod,
} from '../../middlewares/providerMiddleware'
import { SET_PROVIDER, providerReady } from '../../actions/provider'
import { setError } from '../../actions/error'
import { FATAL_MISSING_PROVIDER } from '../../errors'
import { Application, LogIn } from '../../utils/Error'
import {
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  SIGN_USER_DATA,
  SIGN_PAYMENT_DATA,
  SIGN_PURCHASE_DATA,
  signUserData,
} from '../../actions/user'
import { resetRecoveryPhrase } from '../../actions/recovery'
import { EncryptedPrivateKey } from '../../unlockTypes'
import { web3MethodCall } from '../../windowTypes'
import { WEB3_CALL, WEB3_RESULT } from '../../actions/web3call'

jest.mock('@unlock-protocol/unlock-js')

const config = {
  providers: {
    UNLOCK: {
      isUnlock: true,
      signUserData: jest.fn(() => ({ data: {}, sig: {} })),
      signPaymentData: jest.fn(() => ({ data: {}, sig: {} })),
      signKeyPurchaseRequestData: jest.fn(() => ({ data: {}, sig: {} })),
      send: jest.fn(),
    },
    NUNLOCK: {
      enable: jest.fn(() => new Promise(resolve => resolve(true))),
    },
    METAMASQUE: {
      enable: jest.fn(() => new Promise(resolve => resolve(true))),
    },
    NOENABLE: {},
  },
}

const getState = () => ({
  provider: 'NUNLOCK',
})

const metamasqueAction = {
  type: SET_PROVIDER,
  provider: 'METAMASQUE',
}

const erroneousAction = {
  type: SET_PROVIDER,
  provider: 'HONLOCK',
}

const sameAction = {
  type: SET_PROVIDER,
  provider: 'NUNLOCK',
}

const unlockAction = {
  type: SET_PROVIDER,
  provider: 'UNLOCK',
}

const noEnableAction = {
  type: SET_PROVIDER,
  provider: 'NOENABLE',
}

let dispatch: () => any

describe('provider middleware', () => {
  beforeEach(() => {
    config.providers['NUNLOCK'].enable = jest.fn(
      () => new Promise(resolve => resolve(true))
    )
    config.providers['METAMASQUE'].enable = jest.fn(
      () => new Promise(resolve => resolve(true))
    )
    dispatch = jest.fn()
  })

  describe('initializeUnlockProvider', () => {
    const emailAddress = 'test@us.er'
    const password = 'guest'
    let key: any = {}
    let address: string = 'address'

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

  describe('SET_PROVIDER', () => {
    it('should initialize the provider when provider is different from one in state', done => {
      expect.assertions(2)
      const next = () => {
        expect(config.providers['METAMASQUE'].enable).toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(metamasqueAction)
    })

    it('should set an error and return if there is no matching provider', done => {
      expect.assertions(3)
      const next = () => {
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        expect(config.providers['METAMASQUE'].enable).not.toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalledWith(
          setError(Application.Fatal(FATAL_MISSING_PROVIDER))
        )
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(erroneousAction)
    })

    it('should set an error and return if the call to enable fails', done => {
      expect.assertions(2)
      config.providers['METAMASQUE'].enable = jest.fn(() => {
        // eslint-disable-next-line promise/param-names
        return new Promise((_, reject) => {
          reject('The front fell off.')
        })
      })

      const next = () => {
        expect(config.providers['METAMASQUE'].enable).toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(metamasqueAction)
    })

    it('should do nothing if provider is the same as in state', done => {
      expect.assertions(3)
      const next = () => {
        expect(config.providers['METAMASQUE'].enable).not.toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(sameAction)
    })

    it('should do nothing if using unlockProvider', done => {
      expect.assertions(3)
      const next = () => {
        expect(config.providers['METAMASQUE'].enable).not.toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(unlockAction)
    })

    it('should simply dispatch providerReady if provider does not have enable method', () => {
      expect.assertions(1)
      const next = () => {
        expect(dispatch).toHaveBeenCalledWith(providerReady())
      }

      providerMiddleware(config)({ getState, dispatch })(next)(noEnableAction)
    })
  })

  describe('SIGN_USER_DATA', () => {
    it('should call UnlockProvider', () => {
      expect.assertions(1)
      const next = () => {
        expect(config.providers['UNLOCK'].signUserData).toHaveBeenCalled()
      }

      providerMiddleware(config)({
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
        expect(config.providers['UNLOCK'].signPaymentData).toHaveBeenCalledWith(
          'tok_1EPsocIsiZS2oQBMRXzw21xh'
        )
      }

      providerMiddleware(config)({
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
        expect(
          config.providers['UNLOCK'].signKeyPurchaseRequestData
        ).toHaveBeenCalledWith(data)
      }

      providerMiddleware(config)({
        getState: () => ({ provider: 'UNLOCK' }),
        dispatch,
      })(next)({
        type: SIGN_PURCHASE_DATA,
        data,
      })
    })
  })

  describe('WEB3_CALL', () => {
    it('should call UnlockProvider', () => {
      expect.assertions(1)

      const payload: web3MethodCall = {
        id: 9001,
        jsonrpc: '2.0',
        method: 'harvest_wheat',
        params: ['tractor=true'],
      }
      const next = () => {
        expect(config.providers['UNLOCK'].send).toHaveBeenCalledWith(
          payload.method,
          payload.params
        )
      }

      providerMiddleware(config)({
        getState: () => ({ provider: 'UNLOCK' }),
        dispatch,
      })(next)({
        type: WEB3_CALL,
        payload,
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

describe('sendMethod', () => {
  const method = 'harvest_wheat'
  const params = ['tractor', 'silo', 'a bag']
  const id = 9001
  const jsonrpc = '2.0'
  const expectedOutput = '12000 cubic hectares of grain'

  it('should dispatch the result of a web3call', async () => {
    expect.assertions(2)
    const payload: web3MethodCall = {
      method,
      params,
      id,
      jsonrpc,
    }
    const provider = {
      send: jest.fn(() => expectedOutput),
    }
    const dispatch = jest.fn()

    await sendMethod(payload, provider, dispatch)

    expect(provider.send).toHaveBeenCalledWith(method, params)
    expect(dispatch).toHaveBeenCalledWith({
      type: WEB3_RESULT,
      payload: {
        id,
        jsonrpc,
        result: {
          id,
          jsonrpc,
          result: expectedOutput,
        },
      },
    })
  })
})

describe('changePassword', () => {
  let oldPassword = 'oldPassword'
  let newPassword = 'newPassword'
  let passwordEncryptedPrivateKey: EncryptedPrivateKey = {
    version: 1,
  }
  let newEncryptedKey: EncryptedPrivateKey = {
    version: 1,
  }
  let dispatch = jest.fn()

  describe('success', () => {
    beforeEach(async () => {
      unlockJs.reEncryptPrivateKey = jest.fn(() =>
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
      expect(unlockJs.reEncryptPrivateKey).toHaveBeenCalledWith(
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
    unlockJs.reEncryptPrivateKey = jest.fn(() =>
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
