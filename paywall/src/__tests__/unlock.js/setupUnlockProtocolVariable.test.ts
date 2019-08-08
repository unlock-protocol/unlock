import setupUnlockProtocolVariable, {
  UnlockAndIframeManagerWindow,
} from '../../unlock.js/setupUnlockProtocolVariable'
import {
  IframeType,
  IframeManagingWindow,
  AddEventListenerFunc,
} from '../../windowTypes'

interface IframeManagingWindowWithAddEventListener
  extends IframeManagingWindow {
  addEventListener: AddEventListenerFunc
}

describe('setupUnlockProtocolVariable', () => {
  let fakeWindow: IframeManagingWindowWithAddEventListener
  let fakeCheckoutUIIframe: IframeType

  beforeEach(() => {
    fakeWindow = {
      document: {
        createElement: jest.fn(),
        querySelector: jest.fn(),
        body: {
          insertAdjacentElement: jest.fn(),
          style: {
            overflow: 'none',
          },
        },
      },
      setInterval: jest.fn(),
      addEventListener: jest.fn(),
    }
    fakeCheckoutUIIframe = {
      contentWindow: {
        postMessage: jest.fn(),
      },
      className: 'unlock start',
      src: 'http://fun.times/checkout',
      setAttribute: jest.fn(),
    }
  })

  it('should set an unlockProtocol variable on the window object', () => {
    expect.assertions(1)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )
    const resultWindow = fakeWindow as UnlockAndIframeManagerWindow

    expect(resultWindow.unlockProtocol).not.toBeUndefined()
  })

  it('should set a loadCheckoutModal function on the window.unlockProtocol object', () => {
    expect.assertions(1)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )
    const resultWindow = fakeWindow as UnlockAndIframeManagerWindow

    expect(resultWindow.unlockProtocol.loadCheckoutModal).toBeInstanceOf(
      Function
    )
  })

  it('should set a getState function on the window.unlockProtocol object, which initially returns undefined', () => {
    expect.assertions(2)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )
    const resultWindow = fakeWindow as UnlockAndIframeManagerWindow

    expect(resultWindow.unlockProtocol.getState).toBeInstanceOf(Function)
    expect(resultWindow.unlockProtocol.getState()).toBeUndefined()
  })

  it('should not allow setting new variables on the unlockProtocol object', () => {
    expect.assertions(1)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )
    interface MockWindowWithHi extends UnlockAndIframeManagerWindow {
      unlockProtocol: {
        loadCheckoutModal: () => void
        getState: () => undefined
        hi: number
      }
    }
    const resultWindow = fakeWindow as MockWindowWithHi

    expect(() => {
      resultWindow.unlockProtocol.hi = 1
    }).toThrow()
  })

  it('should not allow changing loadCheckoutModal on the unlockProtocol object', () => {
    expect.assertions(1)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )
    const resultWindow = fakeWindow as UnlockAndIframeManagerWindow

    expect(() => {
      resultWindow.unlockProtocol.loadCheckoutModal = () => {}
    }).toThrow()
  })

  it('should show the iframe when unlockProtocol.loadCheckoutModal is called', () => {
    expect.assertions(1)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )

    const resultWindow = fakeWindow as UnlockAndIframeManagerWindow

    resultWindow.unlockProtocol.loadCheckoutModal()
    expect(fakeCheckoutUIIframe.className).toBe('unlock start show')
  })

  it('should return hideCheckoutModal', () => {
    expect.assertions(2)

    const hideCheckout = setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )

    const resultWindow = fakeWindow as UnlockAndIframeManagerWindow

    resultWindow.unlockProtocol.loadCheckoutModal()
    expect(fakeCheckoutUIIframe.className).toBe('unlock start show')

    hideCheckout()
    expect(fakeCheckoutUIIframe.className).toBe('unlock start')
  })
})
