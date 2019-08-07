import { EventEmitter } from 'events'
import { PostMessages } from '../messageTypes'
import {
  PostMessageResponder,
  mainWindowPostOffice,
  PostMessageListener,
} from '../utils/postOffice'
import {
  IframeType,
  IframeManagingWindow,
  PostOfficeWindow,
  OriginWindow,
} from '../windowTypes'
import { makeIframe, addIframeToDocument } from './iframeManager'
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

export default class CheckoutIframeMessageEmitter extends FancyEmitter {
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

    this.iframe = makeIframe(window, checkoutIframeUrl)
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
    this.iframe.className = 'unlock start show'
  }

  hideIframe() {
    this.iframe.className = 'unlock start'
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
