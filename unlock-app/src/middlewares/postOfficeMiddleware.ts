import { Action } from 'redux'
import { IframePostOfficeWindow } from '../utils/postOffice'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'
import { setError } from '../actions/error'
import { KEY_PURCHASE_INITIATED } from '../actions/user'
import { PostOffice } from '../utils/Error'
import { addToCart } from '../actions/keyPurchase'

const postOfficeMiddleware = (window: IframePostOfficeWindow, config: any) => {
  const postOfficeService = new PostOfficeService(
    window,
    config.requiredNetworkId
  )

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
        if (action.type === KEY_PURCHASE_INITIATED) {
          postOfficeService.transactionInitiated()
          postOfficeService.hideAccountModal()
        }

        next(action)
      }
    }
  }
}

export default postOfficeMiddleware
