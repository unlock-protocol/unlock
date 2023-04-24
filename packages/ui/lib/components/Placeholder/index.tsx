import { Line } from './Line'
import { Image } from './Image'
import { Card } from './Card'
import { classed } from '@tw-classed/react'

export const Root = classed.div('flex', {
  variants: {
    spaced: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    inline: {
      false: 'flex-col',
    },
  },
  defaultVariants: {
    spaced: 'md',
    inline: false,
  },
})

Root.displayName = 'Root'

export const Placeholder = {
  Line,
  Image,
  Root,
  Card,
}
