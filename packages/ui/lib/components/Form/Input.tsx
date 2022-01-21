import type { InputHTMLAttributes, ForwardedRef } from 'react'
import type { Size, State, SizeStyleProp, StateStyleProp } from '../../types'
import { forwardRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'

export interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  state?: State
  message?: string
  icon?: ReactNode
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'px-2 py-1',
  medium: 'px-4 py-2',
  large: 'px-4 py-3',
}

const STATE_STYLES: StateStyleProp = {
  error: 'border-red-500',
  success: 'border-green-500',
}

export const Input = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      className,
      state,
      message,
      label,
      icon,
      ...inputProps
    } = props
    const inputSizeStyle = SIZE_STYLES[size]
    const inputStateStyle = STATE_STYLES[state!]
    const inputClass = twMerge('relative flex items-center rounded border', inputSizeStyle, inputStateStyle)
    return (
      <FieldLayout label={label} size={size} state={state} message={message}>
        <div className={inputClass}>
          <input
            {...inputProps}
            id={label}
            value={value}
            ref={ref}
            className="w-full outline-none"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none">
            {icon}
          </span>
        </div>
      </FieldLayout>
    )
  }
)

Input.displayName = 'Input'
