import { classed } from '@tw-classed/react'
import React, { forwardRef } from 'react'

const BaseCard = classed.div('w-full rounded-2xl animate-pulse bg-gray-200', {
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
})

export type CardProps = React.ComponentProps<typeof BaseCard>

export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  return <BaseCard ref={ref} {...props} />
})

Card.displayName = 'Card'
