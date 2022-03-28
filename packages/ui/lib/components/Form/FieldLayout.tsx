import type { ReactNode } from 'react'
import { Size, State, SizeStyleProp, StateStyleProp } from '../../types'
import { twMerge } from 'tailwind-merge'

export interface Props {
  label?: string
  size?: Size
  state?: State
  message?: string
  children: ReactNode
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

const STATE_STYLES: StateStyleProp = {
  error: 'text-red-500',
  success: 'text-green-500',
}

export function FieldLayout(props: Props) {
  const { children, label, size = 'medium', state, message } = props
  const labelSizeStyle = SIZE_STYLES[size!]
  const labelClass = twMerge('px-1', labelSizeStyle)
  const messageClass = twMerge('text-sm', STATE_STYLES[state!])
  return (
    <div className="grid gap-1">
      {label && (
        <label className={labelClass} htmlFor={label}>
          {label}
        </label>
      )}
      {children}
      {message && (
        <div>
          <p className={messageClass}>{message} </p>
        </div>
      )}
    </div>
  )
}
