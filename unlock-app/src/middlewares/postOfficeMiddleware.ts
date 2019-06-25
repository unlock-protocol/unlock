import { iframePostOffice, IframePostOfficeWindow } from '../utils/postOffice'

const postOfficeMiddleware = (window: IframePostOfficeWindow) => {
  const postOffice = iframePostOffice(window, 'Account UI')
  return (_: any) => {
    //return ({ getState, dispatch }) => {
    postOffice.addHandler('boilerplate, not used yet', () => {})
    return (next: (action: any) => void) => (action: any) => {
      next(action)
    }
  }
}

export default postOfficeMiddleware
