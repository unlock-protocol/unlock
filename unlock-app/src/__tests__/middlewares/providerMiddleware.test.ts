import { createAccountAndPasswordEncryptKey } from '@unlock-protocol/unlock-js'
import providerMiddleware, {
  initializeUnlockProvider,
} from '../../middlewares/providerMiddleware'
import { SET_PROVIDER, providerReady } from '../../actions/provider'
import { setError } from '../../actions/error'
import { FATAL_MISSING_PROVIDER } from '../../errors'
import { Application, LogIn } from '../../utils/Error'
import {
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  SIGN_USER_DATA,
} from '../../actions/user'

const config = {
  providers: {
    UNLOCK: {
      isUnlock: true,
      signUserData: jest.fn(() => ({ data: {}, sig: {} })),
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
    let key: any
    let address: string

    beforeEach(async () => {
      const info = await createAccountAndPasswordEncryptKey(password)
      key = info.passwordEncryptedPrivateKey
      address = info.address
    })

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
})
