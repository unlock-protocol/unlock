import type { AllHTMLAttributes, ElementType } from 'react'
import { createElement, forwardRef } from 'react'
import { Size } from '../../types'

type HTMLProps = Omit<AllHTMLAttributes<HTMLElement>, 'as'>

export interface Props extends Omit<HTMLProps, 'size'> {
  as?: ElementType
  size?: Size
}

export const Box = forwardRef<HTMLElement, Props>(
  ({ as = 'div', ...props }: Props, ref) => {
    return createElement(as, {
      ...props,
      ref,
    })
  }
)

Box.displayName = 'Box'
