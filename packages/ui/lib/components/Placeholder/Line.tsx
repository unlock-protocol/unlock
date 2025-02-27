import { classed } from '@tw-classed/react'
import React, { forwardRef } from 'react'

const BaseLine = classed.div('bg-gray-200 rounded-xl animate-pulse', {
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
      full: 'w-full',
    },
  },
  defaultVariants: {
    size: 'md',
    width: 'full',
  },
})

export type LineProps = React.ComponentProps<typeof BaseLine>

export const Line = forwardRef<HTMLDivElement, LineProps>((props, ref) => {
  return <BaseLine ref={ref} {...props} />
})

Line.displayName = 'Line'
