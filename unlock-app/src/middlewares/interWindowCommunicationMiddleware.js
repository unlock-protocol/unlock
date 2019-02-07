import { OPEN_MODAL_IN_NEW_WINDOW, HIDE_MODAL } from '../actions/modal'
import { inIframe } from '../config'
import { lockRoute } from '../utils/routes'
import { setAccount } from '../actions/accounts'
import localStorageAvailable from '../utils/localStorage'

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const interWindowCommunicationMiddleware = window => ({
  getState,
  dispatch,
}) => {
  const parent = window.parent
  const isInIframe = inIframe(window)
  return next => {
    if (isInIframe) {
      // if we are in the paywall on an iframe, account is not defined
      // for coinbase wallet or trust wallet, and probably others.
      // this checks the hash for a valid account and if found,
      // sets our account to this account. This triggers retrieval
      // of keys for that account, allowing the paywall to function
      const { router, account } = getState()
      if (!account) {
        const { account: address } = lockRoute(router.location.pathname)
        if (address) {
          dispatch(setAccount({ address }))
          // for subsequent accesses to paywalls, we save the user account in localStorage
          // this is ONLY a stopgap until we can implement our own paywall-specific provider
          if (localStorageAvailable(window)) {
            window.localStorage.setItem('__unlock__account__', address)
          }
        } else if (localStorageAvailable(window)) {
          // retrieve the stored account saved when the user purchased a key in the past
          const storedAddress = window.localStorage.getItem(
            '__unlock__account__'
          )
          if (storedAddress) {
            dispatch(setAccount({ address: storedAddress }))
          }
        }
      }
    }
    return action => {
      if (isInIframe && action.type === OPEN_MODAL_IN_NEW_WINDOW) {
        parent.postMessage('redirect', parent.origin)
      } else if (!isInIframe && action.type === HIDE_MODAL) {
        // if the user clicks the button to go to content,
        // we redirect back to the content, appending as a hash
        // the user account. This is not sent to the server.
        // then, the paywall.min.js script detects the hash
        // and forwards it to the paywall in the iframe.
        // the code at the top of this file handles that case
        const {
          router,
          account: { address },
        } = getState()
        const { redirect } = lockRoute(router.location.pathname)
        if (redirect) {
          window.location.href = redirect + '#' + address
        }
      }
      return next(action)
    }
  }
}

export default interWindowCommunicationMiddleware
