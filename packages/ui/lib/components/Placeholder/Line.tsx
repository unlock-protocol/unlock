import { classed } from '@tw-classed/react'

export const Line = classed.div('w-full bg-gray-100 rounded-xl animate-pulse', {
  variants: {
    size: {
      sm: 'h-4',
      md: 'h-6',
      lg: 'h-8',
      xl: 'h-10',
    },
    width: {
      sm: 'w-1/4',
      md: 'w-1/3',
      lg: 'w-1/2',
      xl: 'w-3/4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

Line.displayName = 'Line'
