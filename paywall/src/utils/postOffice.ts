import { MessageTypes, ExtractPayload, PostMessages } from '../messageTypes'
import { PostOfficeWindow, EventTypes } from '../windowTypes'

export interface MessageEvent {
  source: any
  origin: string
  data: any
}

export type MessageHandler = (event: MessageEvent) => void

interface location {
  href: string
}

export interface IframePostOfficeWindow extends PostOfficeWindow {
  parent: PostMessageTarget
  location: location
}

export interface PostMessageTarget {
  postMessage: (data: any, origin: string) => void
}

export interface Iframe {
  contentWindow: PostMessageTarget
}

export type PostMessageResponder<T extends MessageTypes> = (
  type: T,
  payload: ExtractPayload<T>
) => void

export type PostMessageListener = (
  payload: any,
  respond: any // TODO fix to make this the same signature as postMessage
) => void

export interface PostMessageHandlers {
  [key: string]: Map<PostMessageListener, PostMessageListener>
}

// Just a wrapper for the "check if we should print and disable eslint" pattern
export function debugLogger(method: 'log' | 'error', ...args: any[]) {
  const debug = process.env.DEBUG
  if (debug) {
    // eslint-disable-next-line no-console
    console[method](...args)
  }
}

/**
 * postMessage manager
 *
 * This abstracts the setting up of listeners and senders for postMessage
 * It handles all security-related aspects and allows setting handlers that
 * respond to specific message types.
 *
 * A message is of format: { type: 'type', payload: <any> }
 *
 * Handlers are passed the payload and a callback that can be used to send
 * a response to the iframe that sent the query. It accepts the type and
 * the response payload
 *
 * @param {window} window the current window context
 * @param {window} target the target window object
 * @param {string} targetOrigin the origin of the target (in CORS settings
 *                              this cannot be retrieved from the target)
 */
export function setupPostOffice<T extends MessageTypes = MessageTypes>(
  window: PostOfficeWindow,
  target: PostMessageTarget,
  targetOrigin: string,
  local: string,
  remote: string
) {
  // TODO We should not read from process.env
  const debug = process.env.DEBUG
  if (!targetOrigin || !target) {
    throw new Error(
      'cannot safely postMessage without knowing the target origin'
    )
  }
  const handlers: PostMessageHandlers = {}
  window.addEventListener(EventTypes.MESSAGE, event => {
    // **SECURITY CHECKS**
    // ignore messages that do not come from our target window
    if (event.source !== target || event.origin !== targetOrigin) return
    // data must be of shape { type: 'type', payload: <value> }
    if (!event.data || !event.data.type) return
    if (!event.data.hasOwnProperty('payload')) return
    if (typeof event.data.type !== 'string') return
    const listeners = handlers[event.data.type]
    if (listeners && listeners.size) {
      listeners.forEach(listener => {
        if (debug) {
          // eslint-disable-next-line no-console
          console.log(
            `[pO] ${local} <-- ${remote}`,
            event.data.type,
            event.data.payload,
            targetOrigin
          )
        }
        const responder = (type: T, response: ExtractPayload<T>) => {
          if (debug) {
            // eslint-disable-next-line no-console
            console.log(
              `[pO respond] ${local} --> ${remote}`,
              type,
              response,
              targetOrigin
            )
          }
          target.postMessage({ type, payload: response }, targetOrigin)
        }
        listener(event.data.payload, responder)
      })
    }
  })
  return {
    addHandler: (type: string, listener: PostMessageListener) => {
      if (!handlers[type]) {
        handlers[type] = new Map()
      }
      handlers[type].set(listener, listener)
    },
    postMessage: <T extends MessageTypes>(
      type: T,
      payload: ExtractPayload<T>
    ) => {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log(`[pO] ${local} --> ${remote}`, type, payload, targetOrigin)
      }
      target.postMessage({ type, payload }, targetOrigin)
    },
  }
}

export function postMessageIsSafe(
  message: MessageEvent,
  sourceWindow: PostMessageTarget,
  sourceOrigin: string
) {
  const errors: string[] = []

  if (message.source !== sourceWindow) {
    errors.push('PostMessage source does not match expected source')
  }

  if (message.origin !== sourceOrigin) {
    errors.push('PostMessage origin does not match expected origin')
  }

  // PostMessage must carry data, which must be of shape
  // { type: 'type', payload: <value> }
  if (!message.data) {
    errors.push('PostMessage does not contain a data property')
  }

  if (!message.data.type) {
    errors.push("PostMessage's data property does not have a type property")
  }

  if (!message.data.hasOwnProperty('payload')) {
    errors.push("PostMessage's data property does not have a payload property")
  }

  if (typeof message.data.type !== 'string') {
    errors.push("PostMessage's data.type property is not a string")
  }

  if (errors.length) {
    debugLogger('error', errors, message)
    // Any number of errors other than 0 causes us to distrust the postMessage
    return false
  }

  // Nothing went wrong, so we can act on this postMessage
  return true
}

export function emitPostMessagesFrom(
  // The iframe from which we will receive messages
  sourceWindow: PostMessageTarget,
  // The URI of `sourceWindow`
  sourceOrigin: string,
  // The window from which this function is called
  window: PostOfficeWindow,
  // Called every time the listener gets a message that passes
  emit: (type: PostMessages, payload: any) => void
) {
  window.addEventListener(EventTypes.MESSAGE, message => {
    // We won't operate on any message that doesn't pass the checks
    if (postMessageIsSafe(message, sourceWindow, sourceOrigin)) {
      // postMessageIsSafe asserted that the message has `type` and `payload`
      // fields inside `data`
      emit(message.data.type, message.data.payload)
    }
  })

  return {
    postMessage: <T extends MessageTypes>(
      type: T,
      payload: ExtractPayload<T>
    ) => {
      // Alias these for clear semantics -- the source that we listen to is also
      // the target we post to
      const targetWindow = sourceWindow
      const targetOrigin = sourceOrigin
      targetWindow.postMessage({ type, payload }, targetOrigin)
    },
  }
}

/**
 * set up a post office inside an iframe
 *
 * Note: the iframe *must* have a search parameter containing the parent window's origin
 *
 * https://iframe.url.com/?origin=<url-encoded parent window origin>
 *
 * @param {window} the iframe's window object
 */
export function iframePostOffice(
  window: IframePostOfficeWindow,
  local = 'iframe',
  remote = 'main window'
) {
  const url = new URL(window.location.href)
  const origin: string = url.searchParams.get('origin') || ''
  return setupPostOffice(window, window.parent, origin, local, remote)
}

/**
 * set up a post office inside the primary application window
 *
 * @param {window} window the main window's window object
 * @param {iframe} iframe the iframe tag (created with document.createElement())
 * @param {string} iframeOrigin the origin of the created iframe
 */
export function mainWindowPostOffice(
  window: PostOfficeWindow,
  iframe: Iframe,
  iframeOrigin: string,
  local = 'main window',
  remote = 'iframe'
) {
  return setupPostOffice(
    window,
    iframe.contentWindow,
    iframeOrigin,
    local,
    remote
  )
}
