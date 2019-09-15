import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import AccountsIframeMessageEmitter from '../../../unlock.js/PostMessageEmitters/AccountsIframeMessageEmitter'
import { PostMessages, ExtractPayload } from '../../../messageTypes'

describe('AccountsIframeMessageEmitter', () => {
  let fakeWindow: FakeWindow
  const accountsOrigin = 'http://fun.times'

  function makeEmitter(fakeWindow: FakeWindow) {
    const emitter = new AccountsIframeMessageEmitter(
      fakeWindow,
      'http://fun.times/fakey'
    )
    return emitter
  }

  function makeEmitterWithIframe(fakeWindow: FakeWindow) {
    const emitter = new AccountsIframeMessageEmitter(
      fakeWindow,
      'http://fun.times/fakey'
    )
    emitter.createIframe()
    return emitter
  }

  describe('emitter construction', () => {
    beforeEach(() => {
      fakeWindow = new FakeWindow()
    })

    it('should create a dummy user accounts iframe', () => {
      expect.assertions(2)

      const emitter = makeEmitter(fakeWindow)

      expect(emitter.iframe.src).toBe('http://fun.times/fakey')
      expect(emitter.iframe.name).toBe('unlock accounts')
    })

    it('should not add the dummy iframe to the document', () => {
      expect.assertions(1)

      makeEmitter(fakeWindow)

      expect(
        fakeWindow.document.body.insertAdjacentElement
      ).not.toHaveBeenCalled()
    })

    it('should set up addHandler after the iframe is created', () => {
      expect.assertions(1)

      const fakeReady = jest.fn()
      const emitter = makeEmitterWithIframe(fakeWindow)

      emitter.addHandler(PostMessages.READY, fakeReady)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        emitter.iframe,
        accountsOrigin
      )

      expect(fakeReady).toHaveBeenCalled()
    })

    it('should set up a dummy postMessage if the iframe is not created yet', () => {
      expect.assertions(1)

      const emitter = makeEmitter(fakeWindow)
      emitter.iframe.contentWindow.postMessage = jest.fn()

      emitter.postMessage(PostMessages.READY, undefined)

      expect(emitter.iframe.contentWindow.postMessage).not.toHaveBeenCalled()
    })

    it('should set up a dummy addHandler if the iframe is not created yet', () => {
      expect.assertions(1)

      const fakeReady = jest.fn()
      const emitter = makeEmitter(fakeWindow)

      emitter.addHandler(PostMessages.READY, fakeReady)

      fakeWindow.receivePostMessageFromIframe(
        PostMessages.READY,
        undefined,
        emitter.iframe,
        accountsOrigin
      )

      expect(fakeReady).not.toHaveBeenCalled()
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

    beforeEach(() => {
      fakeWindow = new FakeWindow()
      ready = jest.fn()
    })

    type messageTypes =
      | PostMessages.READY
      | PostMessages.INITIATED_TRANSACTION
      | PostMessages.SHOW_ACCOUNTS_MODAL
      | PostMessages.HIDE_ACCOUNTS_MODAL
    type VoidMessages = [string, messageTypes][]
    it.each(<VoidMessages>[
      ['READY', PostMessages.READY],
      ['INITIATED_TRANSACTION', PostMessages.INITIATED_TRANSACTION],
      ['SHOW_ACCOUNTS_MODAL', PostMessages.SHOW_ACCOUNTS_MODAL],
      ['HIDE_ACCOUNTS_MODAL', PostMessages.HIDE_ACCOUNTS_MODAL],
    ])('should emit PostMessages.%s upon receiving it', (_, message) => {
      expect.assertions(1)

      const emitter = makeEmitterWithIframe(fakeWindow)

      emitter.on(message, ready)

      fakeWindow.receivePostMessageFromIframe(
        message,
        undefined,
        emitter.iframe,
        accountsOrigin
      )

      expect(ready).toHaveBeenCalled()
    })

    interface PayloadMessageTypes {
      [PostMessages.UPDATE_ACCOUNT]: ExtractPayload<PostMessages.UPDATE_ACCOUNT>
      [PostMessages.UPDATE_NETWORK]: ExtractPayload<PostMessages.UPDATE_NETWORK>
    }
    type Messages = keyof PayloadMessageTypes
    type PayloadMessages<T extends Messages = Messages> = [
      string,
      T,
      PayloadMessageTypes[T]
    ][]
    it.each(<PayloadMessages>[
      ['UPDATE_ACCOUNT', PostMessages.UPDATE_ACCOUNT, 'account'],
      ['UPDATE_NETWORK', PostMessages.UPDATE_NETWORK, 4],
    ])(
      'should emit PostMessages.%s upon receiving it',
      (_, message, payload) => {
        expect.assertions(1)

        const emitter = makeEmitterWithIframe(fakeWindow)
        const receive: (p: typeof payload) => void = jest.fn()

        emitter.on(message, receive)

        fakeWindow.receivePostMessageFromIframe(
          message,
          payload,
          emitter.iframe,
          accountsOrigin
        )

        expect(receive).toHaveBeenCalledWith(payload)
      }
    )
  })
})
