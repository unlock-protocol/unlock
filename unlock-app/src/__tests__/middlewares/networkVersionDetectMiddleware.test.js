import { setNetwork } from '../../actions/network'

describe('network change detection middleware', () => {
  it('network change on initialize', done => {
    const middleware = require('../../middlewares/networkVersionDetectMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
      getState() {
        return { network: { name: 'nothi' } }
      },
    }

    window.web3 = {
      version: {
        getNetwork: () => {
          return Promise.resolve('hi')
        },
      },
    }

    middleware(store)

    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(setNetwork('hi'))
      done()
    }, 0)
  })

  it('network change on interval', done => {
    const middleware = require('../../middlewares/networkVersionDetectMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
      getState() {
        return { network: { name: 'hi' } }
      },
    }

    window.web3 = {
      version: {
        getNetwork: () => {
          return Promise.resolve('hi')
        },
      },
    }

    middleware(store)

    window.web3 = {
      version: {
        getNetwork: () => {
          return Promise.resolve('nothi')
        },
      },
    }

    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledTimes(1)
      done()
    }, 1001)
  })

  it('no network change', done => {
    const middleware = require('../../middlewares/networkVersionDetectMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
      getState() {
        return { network: { name: 'hi' } }
      },
    }

    window.web3 = {
      version: {
        getNetwork: () => {
          return Promise.resolve('hi')
        },
      },
    }

    middleware(store)

    window.web3 = {
      version: {
        getNetwork: () => {
          return Promise.resolve('hi')
        },
      },
    }

    setTimeout(() => {
      expect(store.dispatch).not.toHaveBeenCalled()
      done()
    }, 1001)
  })
})
