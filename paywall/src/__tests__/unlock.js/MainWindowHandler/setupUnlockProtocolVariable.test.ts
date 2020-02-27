import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import {
  UnlockWindow,
  UnlockAndIframeManagerWindow,
} from '../../../windowTypes'
import { PaywallConfig } from '../../../unlockTypes'
import { PostMessages } from '../../../messageTypes'

describe('MainWindowHandler - setupUnlockProtocolVariable', () => {
  let fakeWindow: FakeWindow

  function getMainWindowHandler() {
    // iframe URLs are unused in this test
    const iframes = new IframeHandler(
      fakeWindow,
      'http://t',
      'http://u',
      'http://v'
    )
    return new MainWindowHandler(fakeWindow, iframes)
  }

  function fullWindow() {
    return (fakeWindow as unknown) as UnlockWindow
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should set an unlockProtocol variable on the window object', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.setupUnlockProtocolVariable()

    expect(fullWindow().unlockProtocol).not.toBeUndefined()
  })

  it('should set a loadCheckoutModal function on the window.unlockProtocol object', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.setupUnlockProtocolVariable()

    expect(fullWindow().unlockProtocol.loadCheckoutModal).toBeInstanceOf(
      Function
    )
  })

  it('should set a getState function on the window.unlockProtocol object, which initially returns undefined', () => {
    expect.assertions(2)

    const handler = getMainWindowHandler()
    handler.setupUnlockProtocolVariable()

    expect(fullWindow().unlockProtocol.getState).toBeInstanceOf(Function)
    expect(fullWindow().unlockProtocol.getState()).toBeUndefined()
  })

  it('should not allow setting new variables on the unlockProtocol object', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.setupUnlockProtocolVariable()

    interface MockWindowWithHi extends UnlockAndIframeManagerWindow {
      unlockProtocol: {
        loadCheckoutModal: () => void
        getState: () => undefined
        resetConfig: (config: PaywallConfig) => void
        hi: number
      }
    }
    const resultWindow = (fakeWindow as unknown) as MockWindowWithHi

    expect(() => {
      resultWindow.unlockProtocol.hi = 1
    }).toThrow()
  })

  it('should not allow changing loadCheckoutModal on the unlockProtocol object', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.setupUnlockProtocolVariable()

    expect(() => {
      fullWindow().unlockProtocol.loadCheckoutModal = () => {}
    }).toThrow()
  })

  it('should show the iframe when unlockProtocol.loadCheckoutModal is called', () => {
    expect.assertions(1)

    const handler = getMainWindowHandler()
    handler.showCheckoutIframe = jest.fn()
    handler.setupUnlockProtocolVariable()

    fullWindow().unlockProtocol.loadCheckoutModal()
    expect(handler.showCheckoutIframe).toHaveBeenCalled()
  })

  describe('resetConfig', () => {
    it('should set a resetConfig function on the window.unlockProtocol object', () => {
      expect.assertions(1)

      const handler = getMainWindowHandler()
      handler.setupUnlockProtocolVariable()

      expect(fullWindow().unlockProtocol.resetConfig).toBeInstanceOf(Function)
    })

    it('should send the normalized config when invoked', () => {
      expect.assertions(3)

      const handler = getMainWindowHandler()
      handler.setupUnlockProtocolVariable()
      const accountsSpy = jest.spyOn(handler.iframes.accounts, 'postMessage')
      const checkoutSpy = jest.spyOn(handler.iframes.checkout, 'postMessage')
      const dataSpy = jest.spyOn(handler.iframes.data, 'postMessage')

      const newConfig = {
        callToAction: {
          default: '',
          expired: '',
          pending: '',
          confirmed: '',
          noWallet: '',
        },
        locks: {},
      }

      fullWindow().unlockProtocol.resetConfig(newConfig)

      expect(accountsSpy).toHaveBeenLastCalledWith(
        PostMessages.CONFIG,
        newConfig
      )
      expect(checkoutSpy).toHaveBeenLastCalledWith(
        PostMessages.CONFIG,
        newConfig
      )
      expect(dataSpy).toHaveBeenLastCalledWith(PostMessages.CONFIG, newConfig)
    })
  })
})
