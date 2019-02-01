import { OPEN_MODAL_IN_NEW_WINDOW } from '../actions/modal'

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const postMessageMiddleware = window => () => {
  let iframe = window.parent
  return next => action => {
    if (!iframe) return next(action)
    if (action.type === OPEN_MODAL_IN_NEW_WINDOW) {
      iframe.contentWindow.postMessage('redirect', iframe.contentWindow.origin)
    }
    return next(action)
  }
}

export default postMessageMiddleware
