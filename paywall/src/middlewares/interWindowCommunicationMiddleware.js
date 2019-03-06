/* eslint promise/prefer-await-to-then: 0 */

import { OPEN_MODAL_IN_NEW_WINDOW, HIDE_MODAL } from '../actions/modal'
import { UPDATE_KEY } from '../actions/key'
import { inIframe } from '../config'
import { lockRoute } from '../utils/routes'
import { setAccount } from '../actions/accounts'
import localStorageAvailable from '../utils/localStorage'
import { POST_MESSAGE_REDIRECT } from '../paywall-builder/constants'

function redirectToContentFromPaywall(window, getState) {
  const {
    router,
    account: { address },
  } = getState()

  const { redirect } = lockRoute(router.location.pathname)
  if (redirect) {
    window.location.href = redirect + '#' + address
  }
}

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const interWindowCommunicationMiddleware = window => ({
  getState,
  dispatch,
}) => {
  let accountChecked = false
  const parent = window.parent
  const isInIframe = inIframe(window)
  return next => {
    return action => {
      const { router, account, modals } = getState()
      if (isInIframe && !accountChecked) {
        accountChecked = true
        // if we are in the paywall on an iframe, account is not defined
        // for coinbase wallet or trust wallet, and probably others.
        // this checks the hash for a valid account and if found,
        // sets our account to this account. This triggers retrieval
        // of keys for that account, allowing the paywall to function
        if (!account) {
          const { account: address } = lockRoute(
            // we need the hash in order to retrieve the account from the iframe URL
            router.location.pathname + router.location.hash
          )
          if (address) {
            dispatch(setAccount({ address }))
            // for subsequent accesses to paywalls, we save the user account in localStorage
            // this is ONLY a stopgap until we can implement our own paywall-specific provider
            if (localStorageAvailable(window)) {
              window.localStorage.setItem('__unlock__account__', address)
            }
          } else {
            if (localStorageAvailable(window)) {
              // retrieve the stored account saved when the user purchased a key in the past
              const storedAddress = window.localStorage.getItem(
                '__unlock__account__'
              )
              if (storedAddress) {
                dispatch(
                  // the fromLocalStorage flag is needed for the overlay to know
                  // that it should open a new window, even though the account
                  // is set.
                  setAccount({ address: storedAddress, fromLocalStorage: true })
                )
              }
            }
          }
        }
      }
      const { lockAddress, prefix } = lockRoute(router.location.pathname)
      if (prefix !== 'paywall') return next(action)
      if (isInIframe) {
        if (action.type === OPEN_MODAL_IN_NEW_WINDOW) {
          parent.postMessage(POST_MESSAGE_REDIRECT, parent.origin)
        }
      } else {
        if (action.type === HIDE_MODAL) {
          // if the user clicks the button to go to content,
          // we redirect back to the content, appending as a hash
          // the user account. This is not sent to the server.
          // then, the paywall.min.js script detects the hash
          // and forwards it to the paywall in the iframe.
          // the code at the top of this file handles that case
          redirectToContentFromPaywall(window, getState)
        }
        if (action.type === UPDATE_KEY) {
          const {
            update: { lock, expiration, owner },
          } = action
          if (
            account &&
            !modals[lockAddress] &&
            owner === account.address &&
            lock === lockAddress &&
            expiration > new Date().getTime() / 1000
          ) {
            redirectToContentFromPaywall(window, getState)
          }
        }
      }
      next(action)
    }
  }
}

export default interWindowCommunicationMiddleware
