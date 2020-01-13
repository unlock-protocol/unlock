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
} from '../../windowTypes'
import { makeIframe, addIframeToDocument } from '../iframeManager'
import { DataIframeEventEmitter } from '../../EventEmitterTypes'

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
 * It simply emits all postMessages it receives as events.
 */
export default class DataIframeMessageEmitter extends FancyEmitter {
  public readonly postMessage: PostMessageResponder<PostMessages>

  public readonly iframe: IframeType

  constructor(
    window: IframeManagingWindow & PostOfficeWindow,
    dataIframeUrl: string
  ) {
    super()

    this.iframe = makeIframe(window, dataIframeUrl, 'unlock data')
    const url = new URL(this.iframe.src)
    addIframeToDocument(window, this.iframe)

    const { postMessage } = emitPostMessagesFrom(
      this.iframe.contentWindow,
      url.origin,
      window,
      this.emitWrapper
    )
    this.postMessage = postMessage
  }

  emitWrapper = (type: PostMessages, payload?: any) => {
    // Don't emit a locks update if the update is empty
    // TODO: move this logic elsewhere -- consumer should be able to
    // handle an empty array
    if (
      type === PostMessages.UPDATE_LOCKS &&
      payload &&
      !Object.keys(payload).length
    ) {
      return
    }

    // Don't emit requests for WEB3 method calls that are poorly formed
    if (type === PostMessages.WEB3 && !this.validateWeb3MethodCall(payload)) {
      return
    }

    this.emit(type as any, payload)
  }

  /**
   * Validate a payload sent from the data iframe to ensure it is in fact a web3 method call
   */
  validateWeb3MethodCall(payload: UnvalidatedPayload) {
    if (!payload || typeof payload !== 'object') return false
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
}
