import { Action } from '../unlockTypes'
import { IframePostOfficeWindow } from '../utils/postOffice'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'
import { setError } from '../actions/error'
import { KEY_PURCHASE_INITIATED } from '../actions/user'
import { PostOffice } from '../utils/Error'
import { addToCart } from '../actions/keyPurchase'
import { SET_ACCOUNT } from '../actions/accounts'

const postOfficeMiddleware = (window: IframePostOfficeWindow, config: any) => {
  const postOfficeService = new PostOfficeService(
    window,
    config.requiredNetworkId
  )
  // No account yet, will be set after login
  postOfficeService.setAccount(null)

  return ({ dispatch }: any) => {
    postOfficeService.on(PostOfficeEvents.Error, message => {
      dispatch(setError(PostOffice.Diagnostic(message)))
    })

    postOfficeService.on(PostOfficeEvents.KeyPurchase, (lock, tip) => {
      postOfficeService.showAccountModal()
      dispatch(addToCart({ lock, tip }))
    })

    return (next: any) => {
      return (action: Action) => {
        if (action.type === SET_ACCOUNT) {
          postOfficeService.setAccount(action.account.address)
        } else if (action.type === KEY_PURCHASE_INITIATED) {
          postOfficeService.transactionInitiated()
          postOfficeService.hideAccountModal()
        }

        next(action)
      }
    }
  }
}

export default postOfficeMiddleware
