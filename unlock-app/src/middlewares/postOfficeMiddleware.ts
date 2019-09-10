import { Action } from '../unlockTypes'
import { IframePostOfficeWindow } from '../utils/postOffice'
import { getItem, setItem } from '../utils/localStorage'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'
import { setError } from '../actions/error'
import { KEY_PURCHASE_INITIATED } from '../actions/user'
import { PostOffice } from '../utils/Error'
import { addToCart, DISMISS_PURCHASE_MODAL } from '../actions/keyPurchase'
import { SET_ACCOUNT } from '../actions/accounts'
import { USER_ACCOUNT_ADDRESS_STORAGE_ID } from '../constants'

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
  const userAccountAddress = getItem(window, USER_ACCOUNT_ADDRESS_STORAGE_ID)
  const gotAddressFromStorage = !!userAccountAddress
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

          // There are two paths for logging in:
          //
          // 1. The user had previously logged in, and we pulled their address
          // from localStorage and "optimistically" browsed the page without
          // logging in. Then, by attempting to purchase a key, they submitted a
          // login. In that case, we should not hide the account modal, since
          // they will need it open for the next step (key purchase
          // confirmation).
          //
          // 2. The user had not previously logged in (address was null in
          // localStorage). In this case, they were confronted with the login
          // modal immediately upon visiting the page and will need it to get
          // out of the way so that they can interact with the checkout.
          if (!gotAddressFromStorage) {
            postOfficeService.hideAccountModal()
          }
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
