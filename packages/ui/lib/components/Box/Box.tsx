import type { AllHTMLAttributes, ElementType } from 'react'
import { createElement, forwardRef } from 'react'

type HTMLProps = Omit<AllHTMLAttributes<HTMLElement>, 'as'>

interface Props extends HTMLProps {
  as?: ElementType
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
