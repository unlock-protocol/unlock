/* 
centraliced helper for toasts,
if in the future we need to change toast functionality/library
we can do it from here without change everything from around the codebase
*/

import { Renderable, toast, Toast, ToastOptions } from 'react-hot-toast'

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
    opts?:
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

const options: ToastOptions = {
  style: {
    wordBreak: 'break-word',
  },
}

export const ToastHelper: ToastHelperProps = {
  success: (message) => toast.success(message, options),
  error: (message) => toast.error(message, options),
  promise: async (promise, msgs, opts = {}) => {
    const start = new Date().getTime()
    const result = await toast.promise(promise, msgs, opts)
    if (new Date().getTime() - start < 300) {
      toast.remove() // This cancels the toast immediately
    }
    return result
  },
  // TODO: we need to provide an errors pages 404/500
  redirectErrorPage: (page) => {
    const redirectPage = `/${page}`
    window.location.href = redirectPage
  },
}
