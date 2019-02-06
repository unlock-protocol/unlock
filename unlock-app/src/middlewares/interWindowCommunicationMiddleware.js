import { OPEN_MODAL_IN_NEW_WINDOW, HIDE_MODAL } from '../actions/modal'
import { inIframe } from '../config'
import { lockRoute } from '../utils/routes'

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const interWindowCommunicationMiddleware = window => ({ getState }) => {
  const parent = window.parent
  const isInIframe = inIframe(window)
  return next => action => {
    if (isInIframe && action.type === OPEN_MODAL_IN_NEW_WINDOW) {
      parent.postMessage('redirect', parent.origin)
    } else if (!isInIframe && action.type === HIDE_MODAL) {
      const { redirect } = lockRoute(getState().router.location.pathname)
      if (redirect) {
        window.location.href = redirect
      }
    }
    return next(action)
  }
}

export default interWindowCommunicationMiddleware
