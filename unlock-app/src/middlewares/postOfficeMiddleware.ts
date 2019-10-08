import { Action } from '../unlockTypes'
import { IframePostOfficeWindow } from '../utils/postOffice'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'
import { getItem, setItem } from '../utils/localStorage'
import { setError } from '../actions/error'
import { KEY_PURCHASE_INITIATED } from '../actions/user'
import { PostOffice } from '../utils/Error'
import { addToCart, DISMISS_PURCHASE_MODAL } from '../actions/keyPurchase'
import { SET_ACCOUNT } from '../actions/accounts'
import {
  USER_ACCOUNT_ADDRESS_STORAGE_ID,
  DEFAULT_USER_ACCOUNT_ADDRESS,
} from '../constants'
import { isAccount } from '../utils/validators'
import { setLockedState } from '../actions/pageStatus'

const postOfficeMiddleware = (window: IframePostOfficeWindow, config: any) => {
  const postOfficeService = new PostOfficeService(
    window,
    config.requiredNetworkId
  )

  // To reduce need to log in, remember the last user account address
  // logged into. User will need to authenticate again to make any
  // purchases, but they will still be able to access any locks they
  // have keys to without logging in. This value should not go into
  // redux within `unlock-app`. Let the sign-in process handle that.
  let userAccountAddress = getItem(window, USER_ACCOUNT_ADDRESS_STORAGE_ID)
  if (!isAccount(userAccountAddress)) {
    // Value retrieved from storage isn't a real account -- either it was null
    // or an invalid address was somehow stored.  We pass an address that will
    // never own any keys, this way user account login is deferred until
    // actually necessary.
    userAccountAddress = DEFAULT_USER_ACCOUNT_ADDRESS
  }

  postOfficeService.setAccount(userAccountAddress)

  // Locks on the paywall, keys are lower-cased lock addresses
  // no need for a reducer here because this state is entirely local to the
  // postOffice
  let locksOnPaywall: { [key: string]: any } = {}

  return ({ dispatch }: any) => {
    postOfficeService.on(PostOfficeEvents.Error, message => {
      dispatch(setError(PostOffice.Diagnostic(message)))
    })

    postOfficeService.on(PostOfficeEvents.LockUpdate, locks => {
      locksOnPaywall = locks
    })

    postOfficeService.on(
      PostOfficeEvents.KeyPurchase,
      (lockAddress: string, tip) => {
        const lock = locksOnPaywall[lockAddress]
        dispatch(addToCart({ lock, tip }))
        postOfficeService.showAccountModal()
      }
    )

    postOfficeService.on(PostOfficeEvents.Locked, () =>
      dispatch(setLockedState(true))
    )
    postOfficeService.on(PostOfficeEvents.Unlocked, () =>
      dispatch(setLockedState(false))
    )

    return (next: any) => {
      return (action: Action) => {
        if (action.type === SET_ACCOUNT) {
          postOfficeService.setAccount(action.account.address)
          // Update the localStorage value for the most recent user
          // account address signed into.
          setItem(
            window,
            USER_ACCOUNT_ADDRESS_STORAGE_ID,
            action.account.address
          )
        } else if (action.type === KEY_PURCHASE_INITIATED) {
          postOfficeService.transactionInitiated()
          postOfficeService.hideAccountModal()
        } else if (action.type === DISMISS_PURCHASE_MODAL) {
          postOfficeService.hideAccountModal()
        }

        next(action)
      }
    }
  }
}

export default postOfficeMiddleware
