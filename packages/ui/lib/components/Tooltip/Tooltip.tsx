import {
  Root,
  TooltipTrigger,
  Content,
  TooltipArrow,
  TooltipContentProps,
} from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

interface Props extends Pick<TooltipContentProps, 'side' | 'sideOffset'> {
  tip: ReactNode
  children: ReactNode
  label?: string
  delay?: number
}

export function Tooltip({
  children,
  delay = 600,
  tip,
  label,
  side,
  sideOffset = 6,
}: Props) {
  return (
    <Root delayDuration={delay}>
      <TooltipTrigger className="cursor-pointer" aria-label={label} asChild>
        {children}
      </TooltipTrigger>
      <Content
        side={side}
        sideOffset={sideOffset}
        className="rounded text-brand-dark text-sm bg-white [box-shadow:0px_8px_30px_rgba(0,0,0,0.08)] px-4 py-0.5"
      >
        <TooltipArrow className="fill-white" />
        {tip}
      </Content>
    </Root>
  )
}
