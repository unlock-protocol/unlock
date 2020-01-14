import { EventEmitter } from 'events'
import { PostMessages } from '../../messageTypes'

import {
  PostMessageResponder,
  emitPostMessagesFrom,
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
import { CheckoutIframeEventEmitter } from '../../EventEmitterTypes'

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

    const { postMessage } = emitPostMessagesFrom(
      this.iframe.contentWindow,
      url.origin,
      window,
      this.emit.bind(this)
    )

    // We want to only post message when we're ready!
    this.postMessage = (type, payload) => {
      if (!this.isReady) {
        this.buffer.push([type, payload])
      } else {
        postMessage(type, payload)
      }
    }
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

  setReady = () => {
    this.isReady = true
    this.flushBuffer()
  }
}
