import startup from '../../unlock.js/startup'

describe('unlock.js startup', () => {
  let fakeWindow
  let call
  let fakeDataIframe
  let fakeCheckoutIframe
  let fakeUserAccountsIframe

  beforeEach(() => {
    call = 0
    fakeDataIframe = {
      name: 'data iframe',
      origin: 'http://paywall',
      setAttribute: jest.fn(),
      contentWindow: {
        postMessage: jest.fn(),
      },
    }
    fakeCheckoutIframe = {
      name: 'checkout iframe',
      origin: 'http://paywall',
      setAttribute: jest.fn(),
      contentWindow: {
        postMessage: jest.fn(),
      },
    }
    fakeUserAccountsIframe = {
      name: 'user accounts iframe',
      origin: 'http://unlock-app',
      setAttribute: jest.fn(),
      contentWindow: {
        postMessage: jest.fn(),
      },
    }
    process.env.PAYWALL_URL = 'http://paywall'
    process.env.USER_IFRAME_URL = 'http://unlock-app'
    fakeWindow = {
      setInterval: jest.fn(),
      document: {
        querySelector: jest.fn(),
        body: {
          style: {},
          insertAdjacentElement: jest.fn(),
        },
        createElement: jest.fn(() => {
          switch (call++) {
            case 0:
              return fakeDataIframe
            case 1:
              return fakeCheckoutIframe
            case 2:
              return fakeUserAccountsIframe
          }
        }),
      },
      origin: 'http://fun.times',
      web3: {
        currentProvider: {
          send: jest.fn(),
        },
      },
      CustomEvent: window.CustomEvent,
      dispatchEvent: jest.fn(),
      unlockProtocolConfig: {
        config: 'thing',
      },
      handlers: {},
      addEventListener: jest.fn((type, handler) => {
        fakeWindow.handlers[type] = fakeWindow.handlers[type] || []
        fakeWindow.handlers[type].push(handler)
      }),
      storage: {},
      localStorage: {
        getItem: jest.fn(key => fakeWindow.storage[key]),
        setItem: jest.fn((key, value) => {
          if (typeof value !== 'string') {
            throw new Error('localStorage only supports strings')
          }
          fakeWindow.storage[key] = value
        }),
        removeItem: jest.fn(key => {
          delete fakeWindow.storage[key]
        }),
      },
    }
  })

  describe('look for immediate cache of locked state', () => {
    it('should dispatch locked if the cache is locked', () => {
      expect.assertions(2)

      fakeWindow.storage['__unlockProtocol.locked'] = 'true'

      startup(fakeWindow)

      const event = fakeWindow.dispatchEvent.mock.calls[0][0]
      expect(event.type).toBe('unlockProtocol')
      expect(event.detail).toBe('locked')
    })

    it('should dispatch unlocked if the cache is unlocked', () => {
      expect.assertions(2)

      fakeWindow.storage['__unlockProtocol.locked'] = 'false'

      startup(fakeWindow)

      const event = fakeWindow.dispatchEvent.mock.calls[0][0]
      expect(event.type).toBe('unlockProtocol')
      expect(event.detail).toBe('unlocked')
    })

    it('should not dispatch unlocked if the cache is empty', () => {
      expect.assertions(1)

      startup(fakeWindow)

      expect(fakeWindow.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('iframe creation', () => {
    it('should create a data iframe with the correct URL', () => {
      expect.assertions(2)

      startup(fakeWindow)

      expect(fakeDataIframe.setAttribute).toHaveBeenCalledWith(
        'src',
        'http://paywall/static/data-iframe.1.0.html?origin=http%3A%2F%2Ffun.times'
      )
      expect(
        fakeWindow.document.body.insertAdjacentElement
      ).toHaveBeenNthCalledWith(1, 'afterbegin', fakeDataIframe)
    })

    it('should create a Checkout UI iframe with the correct URL', () => {
      expect.assertions(2)

      startup(fakeWindow)

      expect(fakeCheckoutIframe.setAttribute).toHaveBeenCalledWith(
        'src',
        'http://paywall/checkout?origin=http%3A%2F%2Ffun.times'
      )
      expect(
        fakeWindow.document.body.insertAdjacentElement
      ).toHaveBeenNthCalledWith(2, 'afterbegin', fakeCheckoutIframe)
    })

    it('should create a User Accounts UI iframe with the correct URL', () => {
      expect.assertions(2)

      startup(fakeWindow)

      expect(fakeUserAccountsIframe.setAttribute).toHaveBeenCalledWith(
        'src',
        'http://unlock-app/account?origin=http%3A%2F%2Ffun.times'
      )
      expect(
        fakeWindow.document.body.insertAdjacentElement
      ).toHaveBeenNthCalledWith(2, 'afterbegin', fakeCheckoutIframe)
    })
  })

  it('should set up the post offices', () => {
    expect.assertions(1)

    startup(fakeWindow)

    // this is a simple way to test whether setupPostOffices was called
    // by checking to see if event listeners for postMessage were set up
    // The 4 are:
    // - the data iframe post office
    // - the checkout UI post office
    // - the user accounts UI post office
    // - the Web3ProxyProvider post office
    expect(fakeWindow.addEventListener).toHaveBeenCalledTimes(4)
  })
})
