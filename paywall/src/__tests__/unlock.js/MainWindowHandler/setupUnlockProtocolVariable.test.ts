import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import { UnlockWindow } from '../../../windowTypes'
import { UnlockAndIframeManagerWindow } from '../../../unlock.js/setupUnlockProtocolVariable'

describe('MainWindowHandler - setupUnlockProtocolVariable', () => {
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
})
