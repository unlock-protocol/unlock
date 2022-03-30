import type { ReactNode } from 'react'
import type { SizeStyleProp } from '../../types'
import { twMerge } from 'tailwind-merge'
import { Box, Props as BoxProps } from '../Box/Box'

type Variant =
  | 'dark'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'default'

interface Props extends BoxProps {
  iconRight?: ReactNode
  iconLeft?: ReactNode
  variant?: Variant
}

const SIZE_STYLES: SizeStyleProp = {
  tiny: 'text-xs',
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

const VARIANT_STYLES: Record<Variant, string> = {
  default: 'bg-[#dfd8fb] text-brand-ui-primary',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  blue: 'bg-blue-100 text-blue-800',
  dark: 'bg-gray-100 text-gray-800',
  red: 'bg-[#ffe1e3] text-brand-secondary',
}

export function Badge(props: Props) {
  const {
    children,
    size = 'small',
    variant = 'default',
    iconLeft,
    iconRight,
    className,
    as = 'div',
    ...restProps
  } = props
  const labelClass = twMerge(
    'font-medium rounded-full px-2.5 py-1 inline-flex items-center gap-2',
    SIZE_STYLES[size],
    VARIANT_STYLES[variant],
    className
  )
  return (
    <Box as={as} className={labelClass} {...restProps}>
      {iconLeft}
      <span> {children}</span>
      {iconRight}
    </Box>
  )
}
