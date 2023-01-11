import { classed } from '@tw-classed/react'

export const Image = classed.div('bg-gray-100 animate-pulse', {
  variants: {
    size: {
      sm: 'h-24 w-24',
      md: 'w-32 h-32',
      lg: 'w-64 h-64',
      xl: 'w-96 h-96',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    size: 'md',
    rounded: 'md',
  },
})

Image.displayName = 'Image'
