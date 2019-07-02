import { IframePostOfficeWindow } from '../utils/postOffice'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'
import { setError } from '../actions/error'
import { PostOffice } from '../utils/Error'

const postOfficeMiddleware = (window: IframePostOfficeWindow, config: any) => {
  const postOfficeService = new PostOfficeService(
    window,
    config.requiredNetworkId
  )
  return ({ dispatch }: any) => {
    postOfficeService.on(PostOfficeEvents.Error, message => {
      dispatch(setError(PostOffice.Diagnostic(message)))
    })
    postOfficeService.on(PostOfficeEvents.LockUpdate, () => {})
    postOfficeService.on(PostOfficeEvents.KeyPurchase, () => {})
    return (next: (action: any) => void) => (action: any) => {
      next(action)
    }
  }
}

export default postOfficeMiddleware
