import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PurchaseKeyRequest } from '../../../unlockTypes'
import CheckoutIframeMessageEmitter from '../../../unlock.js/PostMessageEmitters/CheckoutIframeMessageEmitter'
import { PostMessages } from '../../../messageTypes'

declare const process: {
  env: any
}
process.env.PAYWALL_URL = 'http://paywall'

describe('CheckoutIframeMessageEmitter', () => {
  let fakeWindow: FakeWindow
  const checkoutOrigin = process.env.PAYWALL_URL

  function makeEmitter(fakeWindow: FakeWindow) {
    const emitter = new CheckoutIframeMessageEmitter(
      fakeWindow,
      'http://fun.times/fakey'
    )
    emitter.setupListeners()
    return emitter
  }

  describe('emitter construction', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should create a checkout iframe', () => {
      expect.assertions(2)

      const emitter = makeEmitter(fakeWindow)

      expect(emitter.iframe.src).toBe('http://fun.times/fakey')
      expect(emitter.iframe.name).toBe('unlock checkout')
    })

    it('should add the checkout iframe to the document', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      expect(
        fakeWindow.document.body.insertAdjacentElement
      ).toHaveBeenCalledWith('afterbegin', emitter.iframe)
    })

    it('should set up postMessage', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.postMessage(PostMessages.SCROLL_POSITION, 5)

      fakeWindow.expectPostMessageSentToIframe(
        PostMessages.SCROLL_POSITION,
        5,
        emitter.iframe,
        process.env.PAYWALL_URL // iframe origin
      )
    })

    it('should set up addHandler', () => {
      expect.assertions(1)

      const fakeReady = jest.fn()
      const emitter = makeEmitter(fakeWindow)

      emitter.addHandler(PostMessages.READY, fakeReady)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        emitter.iframe,
        process.env.PAYWALL_URL
      )

      expect(fakeReady).toHaveBeenCalled()
    })
  })

  describe('iframe visibility', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should show the iframe when showIframe() is called', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.showIframe()

      expect(emitter.iframe.className).toBe('unlock start show')
    })

    it('should disable scrolling on showing the iframe', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.showIframe()

      expect(fakeWindow.document.body.style.overflow).toBe('hidden')
    })

    it('should hide the iframe when hideIframe() is called', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.showIframe()
      emitter.hideIframe()

      expect(emitter.iframe.className).toBe('unlock start')
    })

    it('should enable scrolling on hiding the iframe', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)

      emitter.showIframe()
      emitter.hideIframe()

      expect(fakeWindow.document.body.style.overflow).toBe('')
    })
  })

  describe('setupListeners', () => {
    let ready: () => void
    let dismiss: () => void
    let purchase: (request: PurchaseKeyRequest) => void
    const request: PurchaseKeyRequest = {
      lock: '0x1234567890123456789012345678901234567890',
      extraTip: '0',
    }

    beforeEach(() => {
      fakeWindow = new FakeWindow()
      ready = jest.fn()
      dismiss = jest.fn()
      purchase = jest.fn()
    })

    it('should emit PostMessages.READY upon receiving it', () => {
      expect.assertions(1)

      dismiss()
      purchase(request)
      const emitter = makeEmitter(fakeWindow)

      emitter.on(PostMessages.READY, ready)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        emitter.iframe,
        checkoutOrigin
      )

      expect(ready).toHaveBeenCalled()
    })

    it('should emit PostMessages.DISMISS_CHECKOUT upon receiving it', () => {
      expect.assertions(1)

      dismiss()
      purchase(request)
      const emitter = makeEmitter(fakeWindow)

      emitter.on(PostMessages.DISMISS_CHECKOUT, dismiss)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.DISMISS_CHECKOUT,
        undefined,
        emitter.iframe,
        checkoutOrigin
      )

      expect(dismiss).toHaveBeenCalled()
    })

    it('should emit PostMessages.PURCHASE_KEY upon receiving it', () => {
      expect.assertions(1)

      dismiss()
      purchase(request)
      const emitter = makeEmitter(fakeWindow)

      emitter.on(PostMessages.PURCHASE_KEY, purchase)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.PURCHASE_KEY,
        request,
        emitter.iframe,
        checkoutOrigin
      )

      expect(purchase).toHaveBeenCalledWith(request)
    })
  })
})
