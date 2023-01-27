import type { ReactNode, ButtonHTMLAttributes, ForwardedRef } from 'react'
import type { SizeStyleProp, Size } from '../../types'
import { twMerge } from 'tailwind-merge'
import { forwardRef } from 'react'

// Once we have a design system or language, we should omit className so user doesn't end up deviating too much.
interface Props
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'size' | 'ref' | 'children'
  > {
  size?: Size
  icon: ReactNode
  label: string
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'p-1',
  medium: 'p-2',
  large: 'p-3',
}

export const IconButton = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    const buttonClass = twMerge(
      'rounded hover:fill-brand-ui-primary',
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
        {props.icon}
      </button>
    )
  }
)
