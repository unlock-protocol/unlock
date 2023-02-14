import { ForwardedRef, TextareaHTMLAttributes, ReactNode } from 'react'
import type { Size, SizeStyleProp } from '../../types'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'

export interface Props
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  success?: string
  error?: string
  description?: ReactNode
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'pl-2.5 py-1.5 text-sm',
  medium: 'pl-4 py-2 text-base',
  large: 'pl-4 py-2.5',
}

const STATE_STYLES = {
  error:
    'border-brand-secondary hover:border-brand-secondary focus:border-brand-secondary focus:ring-brand-secondary',
  success:
    'border-green-500 hover:border-green-500 focus:border-green-500 focus:ring-green-500',
}

export const TextBox = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLTextAreaElement>) => {
    const {
      size = 'medium',
      value,
      className,
      error,
      success,
      description,
      label,
      ...restProps
    } = props

    const textBoxSizeStyles = SIZE_STYLES[size]
    let textBoxStateStyles = ''

    if (error) {
      textBoxStateStyles = STATE_STYLES.error
    } else if (success) {
      textBoxStateStyles = STATE_STYLES.success
    }

    const textBoxClass = twMerge(
      'block w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1 disabled:bg-gray-100',
      textBoxSizeStyles,
      textBoxStateStyles
    )

    return (
      <FieldLayout
        label={label}
        size={size}
        error={error}
        success={success}
        description={description}
      >
        <textarea
          {...restProps}
          id={label}
          value={value}
          ref={ref}
          className={textBoxClass}
        />
      </FieldLayout>
    )
  }
)
