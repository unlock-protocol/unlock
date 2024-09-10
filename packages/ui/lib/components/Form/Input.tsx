import { InputHTMLAttributes, ForwardedRef, ReactNode } from 'react'
import type { Size, SizeStyleProp } from '../../types'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'
import useClipboard from 'react-use-clipboard'
import { FiCopy as CopyIcon } from 'react-icons/fi'
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
  iconRight?: IconType
  iconClass?: string
  copy?: boolean
  actions?: ReactNode
  optional?: boolean
}

export const SIZE_STYLES: SizeStyleProp = {
  small: 'pl-2.5 py-1.5 text-base md:text-sm',
  medium: 'pl-4 py-2 text-base',
  large: 'pl-4 py-2.5 text-base',
}

export const STATE_STYLES = {
  error:
    'border-brand-secondary hover:border-brand-secondary focus:border-brand-secondary focus:ring-brand-secondary',
  success:
    'border-green-500 hover:border-green-500 focus:border-green-500 focus:ring-green-500',
}

const INPUT_BUTTON_SIZE: SizeStyleProp = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

export const Input = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      copy,
      className,
      error,
      success,
      description,
      label,
      icon,
      iconRight,
      iconClass,
      actions,
      required,
      optional,
      ...inputProps
    } = props
    const [isCopied, setCopy] = useClipboard(props.value as string)
    const hidden = inputProps.type === 'password' || inputProps.hidden

    const inputSizeStyle = SIZE_STYLES[size]
    let inputStateStyles = ''

    if (error) {
      inputStateStyles = STATE_STYLES.error
    } else if (success) {
      inputStateStyles = STATE_STYLES.success
    }

    const inputButtonClass = twMerge(
      'flex items-center justify-center gap-2 text-gray-600 hover:text-black',
      'min-w-[80px]',
      INPUT_BUTTON_SIZE[size]
    )

    return (
      <FieldLayout
        label={label}
        optional={optional}
        required={required}
        size={size}
        error={error}
        success={success}
        description={description}
        hidden={inputProps.type === 'hidden'}
      >
        <div
          className={twMerge(
            'relative flex items-center w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus-within:ring-gray-500 focus-within:border-gray-500 overflow-hidden',
            inputStateStyles
          )}
        >
          {icon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={iconClass}>
                <Icon size={size} icon={icon} />
              </div>
            </span>
          )}
          <input
            required={required}
            {...inputProps}
            id={label}
            value={value}
            ref={ref}
            title={value ? value.toString() : undefined}
            className={twMerge(
              'flex-grow min-w-0 bg-white border-none focus:ring-0 focus:outline-none transition-all duration-200',
              'truncate focus:overflow-visible focus:whitespace-normal rounded-lg',
              inputSizeStyle,
              icon ? 'pl-10' : ''
            )}
          />
          {iconRight && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className={iconClass}>
                <Icon size={size} icon={iconRight} />
              </div>
            </span>
          )}
          <div className="flex items-center space-x-2 flex-shrink-0 pr-2">
            {copy && !hidden && (
              <button onClick={() => setCopy()} className={inputButtonClass}>
                <CopyIcon /> {isCopied ? 'Copied' : 'Copy'}
              </button>
            )}
            {actions}
          </div>
        </div>
      </FieldLayout>
    )
  }
)

Input.displayName = 'Input'
