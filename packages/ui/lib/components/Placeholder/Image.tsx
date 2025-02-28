import { classed } from '@tw-classed/react'
import React, { forwardRef } from 'react'

const BaseImage = classed.div('bg-gray-200 animate-pulse', {
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

export type ImageProps = React.ComponentProps<typeof BaseImage>

export const Image = forwardRef<HTMLDivElement, ImageProps>((props, ref) => {
  return <BaseImage ref={ref} {...props} />
})

Image.displayName = 'Image'
