import {
  TooltipTrigger,
  Content,
  TooltipArrow,
  Portal,
  TooltipContentProps,
  Root,
} from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

export interface Props
  extends Pick<TooltipContentProps, 'side' | 'sideOffset'> {
  tip: ReactNode
  children: ReactNode
  label?: string
  delay?: number
  theme?: 'dark' | 'clear'
}

export function Tooltip({
  children,
  tip,
  label,
  side,
  sideOffset = 6,
  theme = 'clear',
}: Props) {
  const contentColors =
    theme === 'clear' ? 'text-brand-dark bg-white' : 'text-white bg-brand-dark'
  const arrowColor = theme === 'clear' ? 'fill-white' : 'fill-brand-dark'
  return (
    <Root>
      <TooltipTrigger className="cursor-pointer" aria-label={label} asChild>
        {children}
      </TooltipTrigger>
      <Portal>
        <Content
          side={side}
          sideOffset={sideOffset}
          className={`z-50 rounded text-sm ${contentColors} [box-shadow:0px_8px_30px_rgba(0,0,0,0.08)] px-4 py-0.5`}
        >
          <TooltipArrow className={`${arrowColor}`} />
          {tip}
        </Content>
      </Portal>
    </Root>
  )
}
