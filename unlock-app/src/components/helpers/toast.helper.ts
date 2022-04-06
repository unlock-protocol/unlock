/* 
centraliced helper for toasts,
if in the future we need to change toast functionality/library
we can do it from here without change everything from around the codebase
*/

import { Renderable, toast, Toast } from 'react-hot-toast'

interface ToastHelperProps {
  success: (message: string) => void
  error: (message: string) => void
  promise: (
    promise: Promise<any>,
    msgs: {
      loading: Renderable
      success: string
      error: string
    },
    opts:
      | Partial<
          Pick<
            Toast,
            | 'id'
            | 'icon'
            | 'duration'
            | 'ariaProps'
            | 'className'
            | 'style'
            | 'position'
            | 'iconTheme'
          >
        >
      | undefined
  ) => Promise<any>
  redirectErrorPage: (errorPage: '404' | '500') => void
}
export const ToastHelper: ToastHelperProps = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  promise: async (promise, msgs, opts = {}) => {
    await toast.promise(promise, msgs, opts)
  },
  // TODO: we need to provide an errors pages 404/500
  redirectErrorPage: (page) => {
    const redirectPage = `/${page}`
    window.location.href = redirectPage
  },
}
