import { OPEN_MODAL_IN_NEW_WINDOW } from '../actions/modal'

// cribbed from https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
export function inIframe(window) {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const postMessageMiddleware = window => () => {
  const iframe = window.parent
  const enabled = inIframe(window)
  return next => action => {
    if (!enabled) return next(action)
    if (action.type === OPEN_MODAL_IN_NEW_WINDOW) {
      iframe.contentWindow.postMessage('redirect', iframe.contentWindow.origin)
    }
    return next(action)
  }
}

export default postMessageMiddleware
