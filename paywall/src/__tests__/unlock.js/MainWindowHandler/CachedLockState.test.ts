import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import IframeHandler from '../../../unlock.js/IframeHandler'
import { PaywallConfig } from '../../../unlockTypes'

declare const process: {
  env: {
    PAYWALL_URL: string
    USER_IFRAME_URL: string
  }
}

describe('MainWindowHandler - locked/unlocked cache', () => {
  process.env.PAYWALL_URL = 'http://paywall'
  process.env.USER_IFRAME_URL = 'http://app/account'
  let fakeWindow: FakeWindow
  const config: PaywallConfig = {
    locks: {},
    callToAction: {
      default: '',
      pending: '',
      expired: '',
      confirmed: '',
    },
  }

  function getMainWindowHandler() {
    const iframes = new IframeHandler(fakeWindow, '', '', '')
    return new MainWindowHandler(fakeWindow, iframes, config)
  }

  describe('getCachedLockState', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should return "ignore" if there is no cache', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe('ignore')
    })

    it('should return true if cache is true', () => {
      expect.assertions(1)

      fakeWindow.storage['__unlockProtocol.locked'] = 'true'
      const handler = getMainWindowHandler()

      expect(handler.getCachedLockState()).toBe(true)
    })

    it('should return false if cache is false', () => {
      expect.assertions(1)

      fakeWindow.storage['__unlockProtocol.locked'] = 'false'
      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe(false)
    })

    it('should return "ignore" if cache is not valid', () => {
      expect.assertions(1)

      fakeWindow.storage['__unlockProtocol.locked'] = '1'
      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe('ignore')
    })

    it('should return "ignore" if localStorage.getItem() throws', () => {
      expect.assertions(1)

      fakeWindow.localStorage.getItem = () => {
        throw new Error('fail')
      }
      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe('ignore')
    })
  })

  describe('setCachedLockedState', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should save the cached state', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.setCachedLockedState(true)

      expect(fakeWindow.storage['__unlockProtocol.locked']).toBe('true')
    })

    it('should not save cache if localStorage throws', () => {
      expect.assertions(1)

      fakeWindow.localStorage.setItem = () => {
        throw new Error('fail')
      }
      const handler = getMainWindowHandler()
      handler.setCachedLockedState(true)

      expect(fakeWindow.storage).toEqual({})
    })
  })
})
