import { OPEN_MODAL_IN_NEW_WINDOW } from '../actions/modal'
import { inIframe } from '../config'

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
