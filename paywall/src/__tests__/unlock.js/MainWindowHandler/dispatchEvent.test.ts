import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PaywallConfig } from '../../../unlockTypes'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'

describe('MainWindowHandler - dispatchEvent', () => {
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
    const iframes = new IframeHandler(
      fakeWindow,
      'http://t', // these values are unused in this test
      'http://u',
      'http://v'
    )
    return new MainWindowHandler(fakeWindow, iframes, config)
  }

  beforeEach(() => {
    fakeWindow = new FakeWindow()
  })

  it('should create an event with provided detail and dispatch it', () => {
    expect.assertions(2)

    const handler = getMainWindowHandler()
    handler.dispatchEvent('hi')

    const eventDetail = (fakeWindow.dispatchEvent as any).mock.calls[0][0]
      .detail
    expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
      expect.any(CustomEvent)
    )
    expect(eventDetail).toBe('hi')
  })

  it('should create an event the old way if the new way is unsupported', () => {
    expect.assertions(2)
    ;(fakeWindow as any).CustomEvent = function() {
      throw new Error('unsupported')
    }
    fakeWindow.document.createEvent = (type: string) => {
      return new CustomEvent(type)
    }

    const handler = getMainWindowHandler()
    handler.dispatchEvent('hi')

    const eventDetail = (fakeWindow.dispatchEvent as any).mock.calls[0][0]
      .detail
    expect(fakeWindow.dispatchEvent).toHaveBeenCalledWith(
      expect.any(CustomEvent)
    )
    expect(eventDetail).toBe('hi')
  })
})
