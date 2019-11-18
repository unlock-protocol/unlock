import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import MainWindowHandler, {
  IGNORE_CACHE,
} from '../../../unlock.js/MainWindowHandler'
import IframeHandler from '../../../unlock.js/IframeHandler'

describe('MainWindowHandler - locked/unlocked cache', () => {
  let fakeWindow: FakeWindow

  function getMainWindowHandler() {
    const iframes = new IframeHandler(
      fakeWindow,
      'http://t', // these values are unused in this test
      'http://u',
      'http://v'
    )
    return new MainWindowHandler(fakeWindow, iframes)
  }

  describe('getCachedLockState', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should return IGNORE_CACHE if there is no cache', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe(IGNORE_CACHE)
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

    it('should return IGNORE_CACHE if cache is not valid', () => {
      expect.assertions(1)

      fakeWindow.storage['__unlockProtocol.locked'] = '1'
      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe(IGNORE_CACHE)
    })

    it('should return IGNORE_CACHE if localStorage.getItem() throws', () => {
      expect.assertions(1)

      fakeWindow.localStorage.getItem = () => {
        throw new Error('fail')
      }
      const handler = getMainWindowHandler()
      expect(handler.getCachedLockState()).toBe(IGNORE_CACHE)
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

  describe('dispatchCachedLockState', () => {
    it('should dispatch "locked" when the cached lock state is locked', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.getCachedLockState = jest.fn(() => true)
      handler.dispatchEvent = jest.fn()
      handler.dispatchCachedLockState()

      expect(handler.dispatchEvent).toHaveBeenCalledWith('locked')
    })

    it('should dispatch "unlocked" when the cached lock state is unlocked', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.getCachedLockState = jest.fn(() => false)
      handler.dispatchEvent = jest.fn()
      handler.dispatchCachedLockState()

      expect(handler.dispatchEvent).toHaveBeenCalledWith('unlocked')
    })

    it('should not dispatch at all for any other value', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.getCachedLockState = jest.fn(() => 'ignore')
      handler.dispatchEvent = jest.fn()
      handler.dispatchCachedLockState()

      expect(handler.dispatchEvent).not.toHaveBeenCalled()
    })
  })
})
