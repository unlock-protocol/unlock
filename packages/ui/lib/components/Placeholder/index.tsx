import { Line } from './Line'
import { Image } from './Image'
import { Card } from './Card'
import { classed } from '@tw-classed/react'
import React, { forwardRef } from 'react'

const BaseRoot = classed.div('flex', {
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

export type RootProps = React.ComponentProps<typeof BaseRoot>

const Root = forwardRef<HTMLDivElement, RootProps>((props, ref) => {
  return <BaseRoot ref={ref} {...props} />
})

Root.displayName = 'Root'

// For React 19, we need to use a more direct approach with "any" casting
export const Placeholder = {
  // Using "any" is necessary here to make components usable as JSX elements in React 19
  Line: Line as any,
  Image: Image as any,
  Root: Root as any,
  Card: Card as any,
}
