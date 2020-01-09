import { MessageTypes, ExtractPayload } from '../messageTypes'

export interface MessageEvent {
  source: any
  origin: string
  data: any
}

export type MessageHandler = (event: MessageEvent) => void

interface location {
  href: string
}

export interface PostOfficeWindow {
  addEventListener: (type: 'message', handler: MessageHandler) => void
}

export interface IframePostOfficeWindow extends PostOfficeWindow {
  parent: PostMessageTarget
  location: location
  localStorage: Storage
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

export interface PostOffice<T extends MessageTypes = MessageTypes> {
  addHandler: (type: string, listener: PostMessageListener) => void
  postMessage: (type: T, payload: ExtractPayload<T>) => void
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
  const debug = process.env.DEBUG
  if (!targetOrigin || !target) {
    throw new Error(
      'cannot safely postMessage without knowing the target origin'
    )
  }
  const handlers: PostMessageHandlers = {}
  window.addEventListener('message', event => {
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
