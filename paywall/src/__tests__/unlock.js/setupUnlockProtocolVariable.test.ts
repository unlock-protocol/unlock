import setupUnlockProtocolVariable, {
  UnlockAndIframeManagerWindow,
} from '../../unlock.js/setupUnlockProtocolVariable'
import { IframeType, IframeManagingWindow } from '../../windowTypes'

describe('setupUnlockProtocolVariable', () => {
  let fakeWindow: IframeManagingWindow
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
    const resultWindow: UnlockAndIframeManagerWindow = fakeWindow as UnlockAndIframeManagerWindow

    expect(resultWindow.unlockProtocol).not.toBeUndefined()
  })

  it('should set a loadCheckoutModal function on the window.unlockProtocol object', () => {
    expect.assertions(1)

    setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )
    const resultWindow: UnlockAndIframeManagerWindow = fakeWindow as UnlockAndIframeManagerWindow

    expect(resultWindow.unlockProtocol.loadCheckoutModal).toBeInstanceOf(
      Function
    )
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
        hi: number
      }
    }
    const resultWindow: MockWindowWithHi = fakeWindow as MockWindowWithHi

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
    const resultWindow: UnlockAndIframeManagerWindow = fakeWindow as UnlockAndIframeManagerWindow

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

    const resultWindow: UnlockAndIframeManagerWindow = fakeWindow as UnlockAndIframeManagerWindow

    resultWindow.unlockProtocol.loadCheckoutModal()
    expect(fakeCheckoutUIIframe.className).toBe('unlock start show')
  })

  it('should return hideCheckoutModal', () => {
    expect.assertions(2)

    const hideCheckout = setupUnlockProtocolVariable(
      fakeWindow as UnlockAndIframeManagerWindow,
      fakeCheckoutUIIframe
    )

    const resultWindow: UnlockAndIframeManagerWindow = fakeWindow as UnlockAndIframeManagerWindow

    resultWindow.unlockProtocol.loadCheckoutModal()
    expect(fakeCheckoutUIIframe.className).toBe('unlock start show')

    hideCheckout()
    expect(fakeCheckoutUIIframe.className).toBe('unlock start')
  })
})
