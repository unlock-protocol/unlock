import { InputHTMLAttributes, ForwardedRef, useState } from 'react'
import type { Size, State, SizeStyleProp, StateStyleProp } from '../../types'
import { forwardRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'
import useClipboard from 'react-use-clipboard'
import { FiEyeOff as HiddenIcon, FiCopy as CopyIcon } from 'react-icons/fi'
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
  reveal?: boolean
  copy?: boolean
}

const HIDDEN_PLACEHOLDER = '**** **** **** ****'

const SIZE_STYLES: SizeStyleProp = {
  small: 'pl-2.5 py-1.5 text-sm',
  medium: 'pl-4 py-2 text-base',
  large: 'pl-4 py-2.5',
}

const STATE_STYLES: StateStyleProp = {
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
    const [isCopied, setCopy] = useClipboard(props.value as string)
    const {
      size = 'medium',
      value,
      copy,
      className,
      state,
      message,
      label,
      icon,
      reveal,
      ...inputProps
    } = props
    const inputSizeStyle = SIZE_STYLES[size]
    const inputStateStyle = STATE_STYLES[state!]
    const inputButtonClass = twMerge(
      'px-2 py-0.5 border border-gray-300 flex items-center gap-2 hover:border-gray-400 text-gray-600 hover:text-black shadow-sm rounded-lg',
      INPUT_BUTTON_SIZE[size]
    )
    const inputClass = twMerge(
      'block w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1',
      inputSizeStyle,
      inputStateStyle,
      icon ? 'pl-10' : undefined
    )
    const [hidden, setHidden] = useState(reveal)
    function onReveal() {
      setHidden(false)
    }
    return (
      <FieldLayout label={label} size={size} state={state} message={message}>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </span>
          <input
            {...inputProps}
            id={label}
            value={reveal && hidden ? HIDDEN_PLACEHOLDER : value}
            ref={ref}
            className={inputClass}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 ml-4">
            {copy && !hidden && (
              <button onClick={() => setCopy()} className={inputButtonClass}>
                <CopyIcon /> {isCopied ? 'Copied' : 'Copy'}
              </button>
            )}

            {hidden && (
              <button className={inputButtonClass} onClick={onReveal}>
                <HiddenIcon /> Reveal
              </button>
            )}
          </div>
        </div>
      </FieldLayout>
    )
  }
)

Input.displayName = 'Input'
