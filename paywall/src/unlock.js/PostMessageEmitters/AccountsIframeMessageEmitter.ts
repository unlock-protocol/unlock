import { EventEmitter } from 'events'
import { PostMessages, MessageTypes, ExtractPayload } from '../../messageTypes'
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
import { makeIframe, addIframeToDocument } from '../iframeManager'
import {
  UserAccountsIframeEventEmitter,
  UserAccountsIframeEvents,
} from './EventEmitterTypes'
import { waitFor } from '../../utils/promises'

// eslint is too stupid to parse this if the extends is in the class declaration below, so we extract it
class FancyEmitter extends (EventEmitter as {
  new (): UserAccountsIframeEventEmitter
}) {}

export default class UserAccountsIframeMessageEmitter extends FancyEmitter {
  private _addHandler?: (
    type: keyof UserAccountsIframeEvents,
    listener: PostMessageListener
  ) => void = () => {}
  private window: IframeManagingWindow & PostOfficeWindow & OriginWindow

  private _postMessage?: PostMessageResponder<PostMessages> = () => {}
  public iframe: IframeType

  constructor(
    window: IframeManagingWindow & PostOfficeWindow & OriginWindow,
    userIframeUrl: string
  ) {
    super()

    this.window = window
    this.iframe = {
      contentWindow: {
        postMessage: () => {},
      },
      className: '',
      src: userIframeUrl,
      setAttribute: () => {},
    }
  }

  createIframe() {
    const url = new URL(this.iframe.src)
    this.iframe = makeIframe(this.window, this.iframe.src)
    addIframeToDocument(this.window, this.iframe)

    const { postMessage, addHandler } = mainWindowPostOffice(
      window,
      this.iframe,
      url.origin,
      'main window',
      'User Accounts iframe'
    )
    this._postMessage = postMessage
    this._addHandler = addHandler
    this.setupListeners()
  }

  showIframe() {
    // note: if we are using a dummy iframe this will not display anything
    this.iframe.className = 'unlock start show'
  }

  hideIframe() {
    this.iframe.className = 'unlock start'
  }

  async setupListeners() {
    await waitFor(() => this._addHandler)
    if (!this._addHandler) return
    this.addHandler(PostMessages.READY, () => this.emit(PostMessages.READY))
    this.addHandler(PostMessages.UPDATE_ACCOUNT, account =>
      this.emit(PostMessages.UPDATE_ACCOUNT, account)
    )
    this.addHandler(PostMessages.UPDATE_NETWORK, account =>
      this.emit(PostMessages.UPDATE_NETWORK, account)
    )
    this.addHandler(PostMessages.INITIATED_TRANSACTION, () =>
      this.emit(PostMessages.INITIATED_TRANSACTION)
    )
    this.addHandler(PostMessages.SHOW_ACCOUNTS_MODAL, () =>
      this.emit(PostMessages.SHOW_ACCOUNTS_MODAL)
    )
    this.addHandler(PostMessages.HIDE_ACCOUNTS_MODAL, () =>
      this.emit(PostMessages.HIDE_ACCOUNTS_MODAL)
    )
  }

  async addHandler(
    type: keyof UserAccountsIframeEvents,
    listener: PostMessageListener
  ) {
    if (!this._addHandler) return
    this._addHandler(type, listener)
  }

  async postMessage<T extends MessageTypes = MessageTypes>(
    type: T,
    payload: ExtractPayload<T>
  ) {
    if (!this._postMessage) return
    this._postMessage(type, payload)
  }
}
