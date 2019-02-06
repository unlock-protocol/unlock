import { OPEN_MODAL_IN_NEW_WINDOW } from '../actions/modal'
import { inIframe } from '../config'

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const interWindowCommunicationMiddleware = window => () => {
  const parent = window.parent
  const enabled = inIframe(window)
  return next => action => {
    if (!enabled) return next(action)
    if (action.type === OPEN_MODAL_IN_NEW_WINDOW) {
      parent.postMessage('redirect', parent.origin)
    }
    return next(action)
  }
}

export default interWindowCommunicationMiddleware
