import providerMiddleware from '../../middlewares/providerMiddleware'
import { SET_PROVIDER } from '../../actions/provider'
import { setError } from '../../actions/error'
import { FATAL_MISSING_PROVIDER } from '../../errors'

const config = {
  providers: {
    UNLOCK: {
      enable: jest.fn(),
      isUnlock: true,
    },
    NUNLOCK: {
      enable: jest.fn(),
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
    config.providers['UNLOCK'].enable = jest.fn()
    config.providers['NUNLOCK'].enable = jest.fn()
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
