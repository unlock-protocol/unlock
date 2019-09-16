import { EventEmitter } from 'events'
import { PostMessages } from '../../messageTypes'

import {
  PostMessageResponder,
  mainWindowPostOffice,
  PostMessageListener,
} from '../../utils/postOffice'
import {
  IframeType,
  IframeManagingWindow,
  PostOfficeWindow,
  OriginWindow,
} from '../../windowTypes'
import {
  makeIframe,
  addIframeToDocument,
  showIframe,
  hideIframe,
} from '../iframeManager'
import {
  CheckoutIframeEventEmitter,
  CheckoutIframeEvents,
} from './EventEmitterTypes'

class FancyEmitter extends (EventEmitter as {
  new (): CheckoutIframeEventEmitter
}) {}

/**
 * This is an abstraction layer around the post office for the checkout iframe
 *
 * It is used both to listen for incoming messages, and to send outgoing messages.
 * In addition, it handles showing and hiding the iframe. Those pieces are handled
 * in the MainWindowHandler for showing the checkout and user accounts iframes
 */
export default class CheckoutIframeMessageEmitter extends FancyEmitter {
  private window: IframeManagingWindow & PostOfficeWindow & OriginWindow
  public readonly addHandler: (
    type: keyof CheckoutIframeEvents,
    listener: PostMessageListener
  ) => void

  public readonly postMessage: PostMessageResponder<PostMessages>
  public readonly iframe: IframeType
  private buffer: Array<any>
  private isReady: boolean

  constructor(
    window: IframeManagingWindow & PostOfficeWindow & OriginWindow,
    checkoutIframeUrl: string
  ) {
    super()
    this.isReady = false
    this.window = window
    this.iframe = makeIframe(window, checkoutIframeUrl, 'unlock checkout')
    const url = new URL(this.iframe.src)
    addIframeToDocument(window, this.iframe)

    this.buffer = []

    const { postMessage, addHandler } = mainWindowPostOffice(
      window,
      this.iframe,
      url.origin,
      'main window',
      'Checkout UI iframe'
    )
    // We want to only post message when we're ready!
    this.postMessage = (type, payload) => {
      if (!this.isReady) {
        this.buffer.push([type, payload])
      } else {
        postMessage(type, payload)
      }
    }
    this.addHandler = addHandler
  }

  flushBuffer() {
    if (!this.isReady) {
      return
    }
    this.buffer.forEach(([type, payload]) => {
      this.postMessage(type, payload)
    })
  }

  showIframe() {
    showIframe(this.window, this.iframe)
  }

  hideIframe() {
    hideIframe(this.window, this.iframe)
  }

  setupListeners() {
    this.addHandler(PostMessages.READY, () => {
      this.isReady = true
      this.flushBuffer()
      this.emit(PostMessages.READY)
    })
    this.addHandler(PostMessages.DISMISS_CHECKOUT, () =>
      this.emit(PostMessages.DISMISS_CHECKOUT)
    )
    this.addHandler(PostMessages.PURCHASE_KEY, request =>
      this.emit(PostMessages.PURCHASE_KEY, request)
    )
  }
}
