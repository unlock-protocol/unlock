import type { ReactNode } from 'react'
import { Size, SizeStyleProp } from '../../types'
import { twMerge } from 'tailwind-merge'

export interface Props {
  label?: string
  size?: Size
  error?: string
  success?: string
  required?: boolean
  optional?: boolean
  description?: ReactNode
  children: ReactNode
  append?: ReactNode
  hidden?: boolean
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
    append,
    required,
    optional,
    hidden,
  } = props
  const labelSizeStyle = SIZE_STYLES[size!]
  const labelClass = twMerge('px-1', labelSizeStyle)
  const descriptionClass = twMerge('text-gray-600', TEXT_SIZE[size])
  const errorClass = twMerge('text-red-500', TEXT_SIZE[size])
  const successClass = twMerge('text-green-500', TEXT_SIZE[size])

  if (hidden) {
    return null
  }

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

    if (description || optional) {
      return (
        <div id={label} className={descriptionClass}>
          {optional && <span className="mr-1 italic">(optional)</span>}
          {description}
        </div>
      )
    }

    return null
  }
  return (
    <div className="grid gap-1.5">
      {label && (
        <label className={labelClass} htmlFor={label}>
          {label}
          {required ? ' * ' : ''}
        </label>
      )}
      {children}
      <div className="flex items-center justify-between">
        <Message />
        {append}
      </div>
    </div>
  )
}
