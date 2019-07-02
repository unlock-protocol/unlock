import { IframePostOfficeWindow } from '../utils/postOffice'
import {
  PostOfficeEvents,
  PostOfficeService,
} from '../services/postOfficeService'

const postOfficeMiddleware = (window: IframePostOfficeWindow, config: any) => {
  const postOfficeService = new PostOfficeService(
    window,
    config.requiredNetworkId
  )
  postOfficeService.on(PostOfficeEvents.Error, () => {})
  postOfficeService.on(PostOfficeEvents.LockUpdate, () => {})
  postOfficeService.on(PostOfficeEvents.KeyPurchase, () => {})
  return (_: any) => {
    //return ({ getState, dispatch }) => {
    return (next: (action: any) => void) => (action: any) => {
      next(action)
    }
  }
}

export default postOfficeMiddleware
