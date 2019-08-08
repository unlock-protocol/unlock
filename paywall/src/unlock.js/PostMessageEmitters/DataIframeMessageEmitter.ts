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
} from '../../windowTypes'
import { makeIframe, addIframeToDocument } from '../iframeManager'
import { DataIframeEventEmitter, DataIframeEvents } from './EventEmitterTypes'

declare const process: {
  env: any
}

interface UnvalidatedPayload {
  method?: any
  id?: any
  params?: any
}

class FancyEmitter extends (EventEmitter as {
  new (): DataIframeEventEmitter
}) {}

/**
 * This is an abstraction layer around the post office for the data iframe
 *
 * It is used both to listen for incoming messages, and to send outgoing messages.
 * For most, it simply emits what it receives, but in some cases it performs
 * additional logic, such as validating web3 method calls, or not forwarding
 * empty locks
 */
export default class DataIframeMessageEmitter extends FancyEmitter {
  public readonly addHandler: (
    type: keyof DataIframeEvents,
    listener: PostMessageListener
  ) => void

  public readonly postMessage: PostMessageResponder<PostMessages>
  public readonly iframe: IframeType

  constructor(
    window: IframeManagingWindow & PostOfficeWindow,
    dataIframeUrl: string
  ) {
    super()

    this.iframe = makeIframe(window, dataIframeUrl)
    addIframeToDocument(window, this.iframe)

    const { postMessage, addHandler } = mainWindowPostOffice(
      window,
      this.iframe,
      process.env.PAYWALL_URL,
      'main window',
      'Data iframe'
    )
    this.postMessage = postMessage
    this.addHandler = addHandler
  }

  /**
   * Validate a payload sent from the data iframe to ensure it is in fact a web3 method call
   */
  validateWeb3MethodCall(payload: UnvalidatedPayload) {
    if (!payload || typeof payload !== 'object') return
    if (!payload.method || typeof payload.method !== 'string') {
      return false
    }
    if (!payload.params || !Array.isArray(payload.params)) {
      return false
    }
    if (
      typeof payload.id !== 'number' ||
      Math.round(payload.id) !== payload.id
    ) {
      return false
    }
    return true
  }

  public setupListeners() {
    this.addHandler(PostMessages.READY, () => this.emit(PostMessages.READY))
    this.addHandler(PostMessages.READY_WEB3, () =>
      this.emit(PostMessages.READY_WEB3)
    )
    this.addHandler(PostMessages.LOCKED, () => this.emit(PostMessages.LOCKED))
    this.addHandler(PostMessages.UNLOCKED, locks =>
      this.emit(PostMessages.UNLOCKED, locks)
    )
    this.addHandler(PostMessages.ERROR, error =>
      this.emit(PostMessages.ERROR, error)
    )
    this.addHandler(PostMessages.UPDATE_WALLET, update =>
      this.emit(PostMessages.UPDATE_WALLET, update)
    )
    this.addHandler(PostMessages.WEB3, payload => {
      // don't pass on anything that is not a valid web3 request
      if (!this.validateWeb3MethodCall(payload)) return
      this.emit(PostMessages.WEB3, payload)
    })
    this.addHandler(PostMessages.UPDATE_ACCOUNT, account =>
      this.emit(PostMessages.UPDATE_ACCOUNT, account)
    )
    this.addHandler(PostMessages.UPDATE_ACCOUNT_BALANCE, balance =>
      this.emit(PostMessages.UPDATE_ACCOUNT_BALANCE, balance)
    )
    this.addHandler(PostMessages.UPDATE_NETWORK, network =>
      this.emit(PostMessages.UPDATE_NETWORK, network)
    )
    this.addHandler(PostMessages.UPDATE_LOCKS, locks => {
      if (!Object.keys(locks).length) {
        // this happens on a fresh start before the blockchain handler retrieves locks
        // in this case, we ignore the update to simplify downstream
        return
      }
      this.emit(PostMessages.UPDATE_LOCKS, locks)
    })
  }
}
