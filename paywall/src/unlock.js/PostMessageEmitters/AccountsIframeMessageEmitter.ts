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
import {
  makeIframe,
  addIframeToDocument,
  hideIframe,
  showIframe,
} from '../iframeManager'
import {
  UserAccountsIframeEventEmitter,
  UserAccountsIframeEvents,
} from '../../EventEmitterTypes'

// This just keeps the typechecker happy. It may not be possible to
// represent an array of heterogeneous generic types in TS, but this
// gets the job done.
interface Message {
  type: any
  payload: any
}

// eslint is too stupid to parse this if the extends is in the class declaration below, so we extract it
class FancyEmitter extends (EventEmitter as {
  new (): UserAccountsIframeEventEmitter
}) {}

/**
 * This class loads user accounts on-demand
 *
 * As such, it is slightly different from the other emitters.
 * This one does not create the iframe in the constructor, but instead
 * makes a fake one so that we can interact with it as if it were there,
 * but nothing happens unless we actually have an explicit need for user
 * accounts.
 *
 * The Wallet class handles initialization of this, and the
 * IframeHandler class handles setting up cross-iframe communication
 * in the IframeHandler.setupAccountUIHandler() method, which is also
 * called by the Wallet class in Wallet.setupWallet()
 */
export default class AccountsIframeMessageEmitter extends FancyEmitter {
  private _addHandler?: (
    type: keyof UserAccountsIframeEvents,
    listener: PostMessageListener
  ) => void

  private window: IframeManagingWindow & PostOfficeWindow & OriginWindow

  buffer: Message[] = []

  private ready: boolean = false

  private _postMessage?: PostMessageResponder<PostMessages>

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
      name: 'unlock accounts',
      src: userIframeUrl,
      setAttribute: () => {},
    }
  }

  /**
   * This is called by the Wallet.setupWallet() method if user accounts
   * are needed
   */
  createIframe() {
    const url = new URL(this.iframe.src)
    this.iframe = makeIframe(this.window, this.iframe.src, 'unlock accounts')
    addIframeToDocument(this.window, this.iframe)

    const { postMessage, addHandler } = mainWindowPostOffice(
      this.window,
      this.iframe,
      url.origin,
      'main window',
      'User Accounts iframe'
    )
    this._postMessage = postMessage
    this._addHandler = addHandler
    this.setupListeners()
  }

  /**
   * This method is used by the MainWindowHandler to show the account iframe when needed.
   * It also hides the checkout iframe if it is visible
   */
  showIframe() {
    // note: if we are using a dummy iframe this will not display anything
    showIframe(this.window, this.iframe)
  }

  hideIframe() {
    // note: if we are using a dummy iframe this will not hide anything
    hideIframe(this.window, this.iframe)
  }

  private setupListeners() {
    this.addHandler(PostMessages.READY, () => {
      this.ready = true
      // When we receive READY, the iframe exists and the postOffice
      // is set up. Now we can be confident that the buffered messages
      // have been received.
      this.sendBufferedMessages()
      this.emit(PostMessages.READY)
    })
    this.addHandler(PostMessages.UPDATE_ACCOUNT, account =>
      this.emit(PostMessages.UPDATE_ACCOUNT, account)
    )
    this.addHandler(PostMessages.UPDATE_NETWORK, network =>
      this.emit(PostMessages.UPDATE_NETWORK, network)
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

  private sendBufferedMessages() {
    this.buffer.forEach(({ type, payload }: Message) => {
      this.postMessage(type, payload)
    })
    this.buffer = []
  }

  /**
   * This is a proxy that ignores requests if the account iframe is not active yet
   */
  async addHandler(
    type: keyof UserAccountsIframeEvents,
    listener: PostMessageListener
  ) {
    if (!this._addHandler) return
    this._addHandler(type, listener)
  }

  /**
   * This is a proxy that buffers requests if the account iframe is not active yet
   */
  async postMessage<T extends MessageTypes = MessageTypes>(
    type: T,
    payload: ExtractPayload<T>
  ) {
    if (this.ready) {
      // if ready === true, then we necessarily have _postMessage, but
      // the linter can't statically determine that so we have to
      // check.
      if (this._postMessage) {
        this._postMessage(type, payload)
      }

      return
    }

    // We're not ready yet: add message to the buffer, it will be
    // called when _postMessage is set.
    this.buffer.push({
      type,
      payload,
    })
  }
}
