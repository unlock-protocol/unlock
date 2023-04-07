import type { ReactNode, ForwardedRef } from 'react'
import type { SizeStyleProp, Size } from '../../types'
import { twMerge } from 'tailwind-merge'
import { forwardRef } from 'react'
import { Box, Props as BoxProps } from '../Box/Box'
import { Icon } from '../Icon/Icon'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'

export type Variant =
  | 'primary'
  | 'secondary'
  | 'outlined-primary'
  | 'transparent'
  | 'black'
  | 'borderless'

export interface Props extends BoxProps {
  iconRight?: ReactNode
  iconLeft?: ReactNode
  loading?: boolean
  variant?: Variant
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'px-4 py-1.5 text-sm',
  medium: 'px-6 py-2.5 text-base',
  large: 'px-6 py-3 text-lg',
  tiny: 'px-4 py-1 text-xs',
}

const VARIANTS_STYLES: Record<Variant, string> = {
  primary:
    'bg-brand-ui-primary transition ease-in-out duration-300 hover:bg-brand-dark text-white disabled:hover:bg-brand-ui-primary disabled:hover:bg-opacity-75',
  secondary:
    'bg-white transition ease-in-out duration-300 text-brand-dark [box-shadow:0px_8px_30px_0px_rgba(0,_0,_0,_0.08)] hover:[box-shadow:0px_0px_10px_0px_rgba(183,_19,_255,_0.1)] disabled:hover:[box-shadow:0px_8px_30px_0px_rgba(0,_0,_0,_0.08)] disabled:hover:bg-opacity-75',
  'outlined-primary':
    'border-2 border-brand-ui-primary transition ease-in-out duration-300 hover:bg-ui-main-50 text-brand-ui-primary disabled:text-opacity-50 disabled:hover:text-opacity-50 disabled:hover:bg-inherit font-medium disabled:border-opacity-25',
  transparent:
    'bg-transparent border border-gray-200 hover:border-gray-300 text-black transition ease-in-out duration-300 hover:text-ui-main-400 disabled:text-ui-main-400 disabled:hover:text-brand-gray disabled:hover:bg-opacity-75 font-medium',
  black: 'border-2 border-black text-black text-medium',
  borderless:
    'bg-transparent text-black transition ease-in-out duration-300 hover:text-brand-ui-primary disabled:text-brand-gray disabled:hover:text-brand-gray disabled:hover:bg-opacity-75 font-medium p-0',
}

export const Button = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    let {
      children,
      size = 'medium',
      variant = 'primary',
      loading,
      iconLeft,
      iconRight,
      className,
      disabled,
      as = 'button',
      ...restProps
    } = props

    // If loading, button should be disabled
    if (loading) {
      disabled = true
    }

    const buttonClass = twMerge(
      'rounded-full flex justify-center box-border cursor-pointer font-semibold items-center gap-2 disabled:bg-opacity-75  disabled:cursor-not-allowed',
      SIZE_STYLES[size],
      VARIANTS_STYLES[variant],
      className
    )

    return (
      <Box
        as={as}
        className={buttonClass}
        {...restProps}
        disabled={disabled}
        ref={ref}
      >
        {loading ? (
          <Icon
            icon={SpinnerIcon}
            size={size}
            className="animate-spin motion-reduce:invisible "
          />
        ) : (
          iconLeft
        )}
        <span> {children}</span>
        {!loading && iconRight}
      </Box>
    )
  }
)
