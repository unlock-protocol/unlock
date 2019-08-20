import providerMiddleware, {
  initializeProvider,
  delayedDispatch,
  enableProvider,
} from '../../middlewares/providerMiddleware'
import { SET_PROVIDER, providerReady } from '../../actions/provider'
import { setError } from '../../actions/error'
import { FATAL_MISSING_PROVIDER } from '../../errors'
import { dismissWalletCheck } from '../../actions/walletStatus'

const config = {
  providers: {
    UNLOCK: {
      enable: jest.fn(() => new Promise(resolve => resolve(true))),
      isUnlock: true,
    },
    NUNLOCK: {
      enable: jest.fn(() => new Promise(resolve => resolve(true))),
    },
  },
}

const getState = () => ({
  provider: 'NUNLOCK',
})

const unlockAction = {
  type: SET_PROVIDER,
  provider: 'UNLOCK',
}

const erroneousAction = {
  type: SET_PROVIDER,
  provider: 'HONLOCK',
}

const sameAction = {
  type: SET_PROVIDER,
  provider: 'NUNLOCK',
}

let dispatch: () => any

describe('provider middleware', () => {
  beforeEach(() => {
    config.providers['UNLOCK'].enable = jest.fn(
      () => new Promise(resolve => resolve(true))
    )
    config.providers['NUNLOCK'].enable = jest.fn(
      () => new Promise(resolve => resolve(true))
    )
    dispatch = jest.fn()
  })
  describe('SET_PROVIDER', () => {
    it('should initialize the provider when provider is different from one in state', done => {
      expect.assertions(2)
      const next = () => {
        expect(config.providers['UNLOCK'].enable).toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(unlockAction)
    })

    it('should set an error and return if there is no matching provider', done => {
      expect.assertions(3)
      const next = () => {
        expect(config.providers['UNLOCK'].enable).not.toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalledWith(setError(FATAL_MISSING_PROVIDER))
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(erroneousAction)
    })

    it('should set an error and return if the call to enable fails', done => {
      expect.assertions(2)
      config.providers['UNLOCK'].enable = jest.fn(() => {
        // eslint-disable-next-line promise/param-names
        return new Promise((_, reject) => {
          reject('The front fell off.')
        })
      })

      const next = () => {
        expect(config.providers['UNLOCK'].enable).toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(unlockAction)
    })

    it('should do nothing if provider is the same as in state', done => {
      expect.assertions(3)
      const next = () => {
        expect(config.providers['UNLOCK'].enable).not.toHaveBeenCalled()
        expect(config.providers['NUNLOCK'].enable).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
        done()
      }

      providerMiddleware(config)({ getState, dispatch })(next)(sameAction)
    })
  })
  describe('delayedDispatch', () => {
    it('should dispatch after the set time passes', () => {
      expect.assertions(3)
      jest.useFakeTimers()
      const dispatch = jest.fn()
      const time = 750
      const action = () => ({ type: 'neato' })

      delayedDispatch(dispatch, action, time)

      // Most of the way through the timeout, it still hasn't been called
      jest.advanceTimersByTime(749)
      expect(dispatch).not.toHaveBeenCalled()

      // But now it has
      jest.advanceTimersByTime(10)
      expect(dispatch).toHaveBeenCalledWith(action())

      expect(setTimeout).toHaveBeenCalledTimes(1)
    })
  })
  describe('enableProvider', () => {
    it('should return true if the provider can be enabled', async () => {
      expect.assertions(1)
      const provider = {
        enable: () => {
          return
        },
      }

      const result = await enableProvider(provider)
      expect(result).toBeTruthy()
    })

    it('should return false if the provider cannot be enabled', async () => {
      expect.assertions(1)
      const provider = {
        enable: async () => {
          throw new Error('My providing days are over')
        },
      }

      const result = await enableProvider(provider)
      expect(result).toBeFalsy()
    })

    it('should return true if provider does not have enable property', async () => {
      expect.assertions(1)
      const provider = {}

      const result = await enableProvider(provider)
      expect(result).toBeTruthy()
    })
  })
  describe('initializeProvider', () => {
    it('should clear the timeout and dismiss the wallet overlay when done', async () => {
      expect.assertions(3)
      jest.useFakeTimers()
      const provider = {}
      const dispatch = jest.fn()

      await initializeProvider(provider, dispatch)

      // The timeout to open the wallet overlay
      expect(setTimeout).toHaveBeenCalledTimes(1)
      // clearing that timeout at the end of the function
      expect(clearTimeout).toHaveBeenCalledTimes(1)
      // done checking for wallet, hide the overlay
      expect(dispatch).toHaveBeenCalledWith(dismissWalletCheck())
    })

    it('should dispatch providerReady when the provider can be enabled', async () => {
      expect.assertions(1)
      const provider = {}
      const dispatch = jest.fn()

      await initializeProvider(provider, dispatch)

      expect(dispatch).toHaveBeenCalledWith(providerReady())
    })

    it('should set an error when the provider can not be enabled', async () => {
      expect.assertions(1)
      const provider = {
        enable: () => {
          throw new Error('go back to bed, garfield')
        },
      }
      const dispatch = jest.fn()

      await initializeProvider(provider, dispatch)
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error/SET_ERROR',
        })
      )
    })
  })
})
