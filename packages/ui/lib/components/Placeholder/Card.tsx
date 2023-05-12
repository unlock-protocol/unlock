import { classed } from '@tw-classed/react'

export const Card = classed.div(
  'w-full rounded-2xl animate-pulse bg-gray-100',
  {
    variants: {
      size: {
        sm: 'h-24',
        md: 'h-32',
        lg: 'h-64',
        xl: 'h-96',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
)
