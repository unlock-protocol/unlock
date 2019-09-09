import { Action } from '../unlockTypes'
import { IframePostOfficeWindow } from '../utils/postOffice'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'
import { setError } from '../actions/error'
import { KEY_PURCHASE_INITIATED } from '../actions/user'
import { PostOffice } from '../utils/Error'
import { addToCart, DISMISS_PURCHASE_MODAL } from '../actions/keyPurchase'
import { SET_ACCOUNT } from '../actions/accounts'

const postOfficeMiddleware = (window: IframePostOfficeWindow, config: any) => {
  const postOfficeService = new PostOfficeService(
    window,
    config.requiredNetworkId
  )
  // No account yet, will be set after login
  postOfficeService.setAccount(null)

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
          postOfficeService.hideAccountModal()
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
