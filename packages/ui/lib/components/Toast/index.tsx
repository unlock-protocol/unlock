import {
  Renderable,
  toast,
  Toast,
  ToastOptions,
  Toaster,
  ValueOrFunction,
} from 'react-hot-toast'
import { ReactNode } from 'react'

export interface ToastHelperProps {
  success: (message: string) => void
  error: (message: string) => void
  promise: (
    promise: Promise<any>,
    msgs: {
      loading: Renderable
      success: ValueOrFunction<Renderable, any>
      error: ValueOrFunction<Renderable, any>
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
  redirectErrorPage: (page) => {
    const redirectPage = `/${page}`
    window.location.href = redirectPage
  },
}

interface ToastProviderProps {
  children: ReactNode
  position?:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'
}

export function ToastProvider({
  children,
  position = 'top-center',
}: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster position={position} />
    </>
  )
}
