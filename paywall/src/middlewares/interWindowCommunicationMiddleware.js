/* eslint promise/prefer-await-to-then: 0 */

import { UPDATE_KEY, ADD_KEY } from '../actions/key'
import { inIframe } from '../config'
import { lockRoute } from '../utils/routes'
import { setAccount, SET_ACCOUNT } from '../actions/accounts'
import localStorageAvailable from '../utils/localStorage'

// store is unused in this middleware, it is only for listening for actions
// and converting them into postMessage
const interWindowCommunicationMiddleware = window => ({
  getState,
  dispatch,
}) => {
  let accountChecked = false
  const isInIframe = inIframe(window)
  return next => {
    return action => {
      next(action)

      const { router, account } = getState()
      const accountAddress = account && account.address
      // TODO: remove the checking for account in
      // the URL hash as soon as the paywall stops sending it
      if (
        action.type === SET_ACCOUNT &&
        action.account &&
        action.account.fromMainWindow
      ) {
        accountChecked = false
      }
      if (isInIframe && !accountChecked) {
        accountChecked = true
        if (action.account && action.account.fromMainWindow) {
          // we received an update of account from the main window, let's update localStorage
          if (
            action.account.address !== accountAddress &&
            localStorageAvailable(window)
          ) {
            window.localStorage.setItem(
              '__unlock__account__',
              action.account.address
            )
          }
          // if we are in the paywall on an iframe, account is not defined
          // for coinbase wallet or trust wallet, and probably others.
          // this checks the hash for a valid account and if found,
          // sets our account to this account. This triggers retrieval
          // of keys for that account, allowing the paywall to function
        } else if (!account) {
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

      // this needs to be after the reducer is called
      if (
        isInIframe &&
        (action.type === UPDATE_KEY || action.type === ADD_KEY) &&
        !account
      ) {
        const { transactions, keys } = getState()
        const { lockAddress, transaction } = lockRoute(
          router.location.pathname + router.location.hash
        )
        // sanity check: was transaction passed in the hash?
        if (!transaction) return
        const ourTransaction = transactions[transaction]
        // has the transaction been retrieved yet? if not, bail out
        if (!ourTransaction) return
        // sanity check: is this transaction for our lock?
        if (lockAddress !== ourTransaction.lock) return
        // sanity check: is this key for our transaction?
        if (action.id !== ourTransaction.key) return

        // at this point, we know the transaction exists, is for our lock, and
        // because our account has not been set, we should save the account
        // in localStorage
        const { owner } = keys[action.id]
        if (localStorageAvailable(window)) {
          window.localStorage.setItem('__unlock__account__', owner)
        }
        dispatch(setAccount({ address: owner }))
      }
    }
  }
}

export default interWindowCommunicationMiddleware
