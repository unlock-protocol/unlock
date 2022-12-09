import {
  InputHTMLAttributes,
  ForwardedRef,
  ReactNode,
} from 'react'
import type { Size, SizeStyleProp } from '../../types'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'
import { IconType } from 'react-icons'
import { Icon } from '../Icon/Icon'

export interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  success?: string
  error?: string
  description?: ReactNode
  icon?: IconType
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

 export const AddressInput = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      className,
      error,
      success,
      description,
      label,
      icon,
      ...inputProps
    } = props

    const inputSizeStyle = SIZE_STYLES[size]
    let inputStateStyles = ''

    if (error) {
      inputStateStyles = STATE_STYLES.error
    } else if (success) {
      inputStateStyles = STATE_STYLES.success
    }

    const inputClass = twMerge(
      'block w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1 disabled:bg-gray-100',
      inputSizeStyle,
      inputStateStyles,
      icon ? 'pl-10' : undefined
    )

    return (
      <FieldLayout
        label={label}
        size={size}
        error={error}
        success={success}
        description={description}
      >
        <div className="relative">
          {icon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon size={size} icon={icon} />
            </span>
          )}
          <input
            {...inputProps}
            id={label}
            value={value}
            ref={ref}
            className={inputClass}
          />
        </div>
      </FieldLayout>
    )
  }
)

AddressInput.displayName = 'AddressInput'