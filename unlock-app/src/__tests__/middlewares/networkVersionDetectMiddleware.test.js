import { setNetwork } from '../../actions/network'
import middleware from '../../middlewares/networkVersionDetectMiddleware'

describe('network change detection middleware', () => {
  let store

  window.web3 = {
    version: {},
  }

  beforeEach(() => {
    window.web3.version.getNetwork = () => {
      return Promise.resolve('hi')
    }
    store = {
      dispatch: jest.fn(),
      getState() {
        return { network: { name: 'nothi' } }
      },
    }
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('network change on initialize', done => {
    middleware(store)

    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(setNetwork('hi'))
      done()
    }, 0)
  })

  it('network change on interval', done => {
    middleware(store)

    window.web3.version.getNetwork = () => {
      return Promise.resolve('nothi')
    }

    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledTimes(1)
      done()
    }, 1001)
  })

  it('no network change', done => {
    const store = {
      dispatch: jest.fn(),
      getState() {
        return { network: { name: 'hi' } }
      },
    }

    middleware(store)

    window.web3.version.getNetwork = () => {
      return Promise.resolve('hi')
    }

    setTimeout(() => {
      expect(store.dispatch).not.toHaveBeenCalled()
      done()
    }, 1001)
  })
})
