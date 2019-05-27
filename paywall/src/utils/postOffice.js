let handlers = {}

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
export function setupPostOffice(window, target, targetOrigin) {
  if (!targetOrigin || !target) {
    throw new Error(
      'cannot safely postMessage without knowing the target origin'
    )
  }
  window.addEventListener('message', event => {
    // **SECURITY CHECKS**
    // ignore messages that do not come from our target window
    if (event.source !== target || event.origin !== targetOrigin) return
    // data must be of shape { type: 'type', payload: <value> }
    if (!event.data || !event.data.type) return
    if (!event.data.hasOwnProperty('payload')) return
    if (typeof event.data.type !== 'string') return
    if (handlers[event.data.type]) {
      const handler = handlers[event.data.type]
      handler(event.data.payload, (type, response) => {
        if (typeof type !== 'string') {
          throw new Error('internal error: type must be a string')
        }
        target.postMessage({ type, payload: response }, targetOrigin)
      })
    }
  })
  return (type, payload) => {
    target.postMessage({ type, payload }, targetOrigin)
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
export function iframePostOffice(window) {
  const url = new URL(window.location.href)
  const origin = url.searchParams.get('origin')
  return setupPostOffice(window, window.parent, origin)
}

/**
 * set up a post office inside the primary application window
 *
 * @param {window} window the main window's window object
 * @param {iframe} iframe the iframe tag (created with document.createElement())
 * @param {string} iframeOrigin the origin of the created iframe
 */
export function mainWindowPostOffice(window, iframe, iframeOrigin) {
  return setupPostOffice(window, iframe.contentWindow, iframeOrigin)
}

/**
 * @callback handlerCallback
 * @param {string} type the message type to send
 * @param {*} response the response to the original message.
 *                     This is the payload of the response message
 */

/**
 * Set a handler for a posted message
 *
 * @param {string} type the message type this handler is intended to respond to
 * @param {handlerCallback}}handler the callback. This should
 */
export function setHandler(type, handler) {
  const currentHandler = handlers[type] || (() => 1)
  handlers[type] = (type, response) => (
    currentHandler(type, response), handler(type, response)
  )
}

// for unit testing, clearing state between tests
export function _clearHandlers() {
  handlers = {}
}
