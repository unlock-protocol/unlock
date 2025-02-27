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

export const Root = forwardRef<HTMLDivElement, RootProps>((props, ref) => {
  return <BaseRoot ref={ref} {...props} />
})

Root.displayName = 'Root'

export const Placeholder = {
  Line,
  Image,
  Root,
  Card,
}
