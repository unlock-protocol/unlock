import type { ReactNode, ForwardedRef } from 'react'
import type { SizeStyleProp, Size } from '../../types'
import { twMerge } from 'tailwind-merge'
import { forwardRef } from 'react'
import { Box, Props as BoxProps } from '../Box/Box'
import { Icon } from '../Icon/Icon'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'

type Variant = 'primary' | 'secondary' | 'outlined-primary' | 'transparent'

interface Props extends BoxProps {
  iconRight?: ReactNode
  iconLeft?: ReactNode
  loading?: boolean
  variant?: Variant
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-2.5 text-base',
  large: 'px-8 py-3.5 text-lg',
  tiny: 'px-2 py-1 text-xs',
}

const VARIANTS_STYLES: Record<Variant, string> = {
  primary:
    'bg-brand-ui-primary  transition ease-in-out duration-300 hover:bg-brand-dark text-white disabled:hover:bg-brand-ui-primary disabled:hover:bg-opacity-75',
  secondary:
    'bg-white transition ease-in-out duration-300 text-brand-dark [box-shadow:0px_8px_30px_0px_rgba(0,_0,_0,_0.08)] hover:[box-shadow:0px_0px_10px_0px_rgba(183,_19,_255,_0.1)] disabled:hover:[box-shadow:0px_8px_30px_0px_rgba(0,_0,_0,_0.08)] disabled:hover:bg-opacity-75',
  'outlined-primary':
    'border-2 border-brand-ui-primary transition ease-in-out duration-300 hover:text-brand-ui-primary disabled:text-brand-gray disabled:hover:text-brand-gray disabled:hover:bg-opacity-75 font-medium',
  transparent:
    'bg-transparent text-black transition ease-in-out duration-300 hover:text-brand-ui-primary disabled:text-brand-gray disabled:hover:text-brand-gray disabled:hover:bg-opacity-75 font-medium',
}

export const Button = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    const {
      children,
      size = 'medium',
      variant = 'primary',
      loading,
      iconLeft,
      iconRight,
      className,
      as = 'button',
      ...restProps
    } = props
    const buttonClass = twMerge(
      'rounded-full flex justify-center cursor-pointer font-semibold items-center gap-2 disabled:bg-opacity-75  disabled:cursor-not-allowed',
      SIZE_STYLES[size],
      VARIANTS_STYLES[variant],
      className
    )
    return (
      <Box as={as} className={buttonClass} {...restProps} ref={ref}>
        {loading ? (
          <Icon
            icon={SpinnerIcon}
            size={size}
            className="animate-spin motion-reduce:invisible"
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
