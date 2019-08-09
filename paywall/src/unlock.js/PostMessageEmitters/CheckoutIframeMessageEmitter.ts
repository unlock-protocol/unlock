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

declare const process: {
  env: any
}

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

  constructor(
    window: IframeManagingWindow & PostOfficeWindow & OriginWindow,
    checkoutIframeUrl: string
  ) {
    super()

    this.window = window
    this.iframe = makeIframe(window, checkoutIframeUrl, 'unlock checkout')
    addIframeToDocument(window, this.iframe)

    const { postMessage, addHandler } = mainWindowPostOffice(
      window,
      this.iframe,
      process.env.PAYWALL_URL,
      'main window',
      'Checkout UI iframe'
    )
    this.postMessage = postMessage
    this.addHandler = addHandler
  }

  showIframe() {
    showIframe(this.window, this.iframe)
  }

  hideIframe() {
    hideIframe(this.window, this.iframe)
  }

  async setupListeners() {
    this.addHandler(PostMessages.READY, () => this.emit(PostMessages.READY))
    this.addHandler(PostMessages.DISMISS_CHECKOUT, () =>
      this.emit(PostMessages.DISMISS_CHECKOUT)
    )
    this.addHandler(PostMessages.PURCHASE_KEY, request =>
      this.emit(PostMessages.PURCHASE_KEY, request)
    )
  }
}
