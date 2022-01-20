import type { ReactNode, ButtonHTMLAttributes, ForwardedRef } from 'react'
import type { SizeStyleProp, Size } from '../../types'
import { twMerge } from 'tailwind-merge'
import { forwardRef } from 'react'

// Once we have a design system or language, we should omit className so user doesn't end up deviating too much.
interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'ref'> {
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  label: string
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'px-4 py-1.5 text-sm',
  medium: 'px-6 py-2 text-base',
  large: 'px-8 py-3 text-lg',
}

export const Button = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    const buttonClass = twMerge(
      'border rounded hover:bg-gray-50 flex font-semibold items-center gap-4',
      props.size ? SIZE_STYLES[props.size] : SIZE_STYLES['medium'],
      props.className
    )
    return (
      <button
        className={buttonClass}
        {...props}
        ref={ref}
        aria-label={props.label}
      >
        {props.leftIcon}
        {props.children}
        {props.rightIcon}
      </button>
    )
  }
)
