import type { ReactNode } from 'react'
import { Size, SizeStyleProp } from '../../types'
import { twMerge } from 'tailwind-merge'

export interface Props {
  label?: string
  size?: Size
  error?: string
  success?: string
  description?: string
  children: ReactNode
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

const TEXT_SIZE: SizeStyleProp = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
}

export function FieldLayout(props: Props) {
  const {
    children,
    label,
    size = 'medium',
    error,
    success,
    description,
  } = props
  const labelSizeStyle = SIZE_STYLES[size!]
  const labelClass = twMerge('px-1', labelSizeStyle)
  const descriptionClass = twMerge('text-gray-600', TEXT_SIZE[size])
  const errorClass = twMerge('text-red-500', TEXT_SIZE[size])
  const successClass = twMerge('text-green-500', TEXT_SIZE[size])

  function Message() {
    if (error) {
      return (
        <p id={label} className={errorClass}>
          {error}
        </p>
      )
    }
    if (success) {
      return (
        <p id={label} className={successClass}>
          {success}
        </p>
      )
    }

    if (description) {
      return (
        <p id={label} className={descriptionClass}>
          {description}
        </p>
      )
    }

    return null
  }
  return (
    <div className="grid gap-1.5">
      {label && (
        <label className={labelClass} htmlFor={label}>
          {label}
        </label>
      )}
      {children}
      <div className="pl-1">
        <Message />
      </div>
    </div>
  )
}
