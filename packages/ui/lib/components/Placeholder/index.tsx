import { Line } from './Line'
import { Image } from './Image'
import { classed } from '@tw-classed/react'

export const Root = classed.div('grid', {
  variants: {
    spaced: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    spaced: 'md',
  },
})

Root.displayName = 'Root'

export const Placeholder = {
  Line,
  Image,
  Root,
}
