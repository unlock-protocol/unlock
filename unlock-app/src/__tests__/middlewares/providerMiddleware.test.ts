import providerMiddleware from '../../middlewares/providerMiddleware'
import { SET_PROVIDER } from '../../actions/provider'
import { setError } from '../../actions/error'
import { FATAL_MISSING_PROVIDER } from '../../errors'
import Error from '../../utils/Error'

const { Application } = Error

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
        expect(dispatch).toHaveBeenCalledWith(
          setError(Application.Fatal(FATAL_MISSING_PROVIDER))
        )
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
})
