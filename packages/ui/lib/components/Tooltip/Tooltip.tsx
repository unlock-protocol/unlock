import {
  Root,
  TooltipTrigger,
  Content,
  TooltipArrow,
  TooltipContentProps,
  Provider,
} from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

interface Props extends Pick<TooltipContentProps, 'side' | 'sideOffset'> {
  tip: ReactNode
  children: ReactNode
  label?: string
  delay?: number
  theme?: 'dark' | 'clear'
}

export function Tooltip({
  children,
  delay = 600,
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
    <Provider>
      <Root delayDuration={delay}>
        <TooltipTrigger className="cursor-pointer" aria-label={label} asChild>
          {children}
        </TooltipTrigger>
        <Content
          side={side}
          sideOffset={sideOffset}
          className={`rounded text-sm ${contentColors} [box-shadow:0px_8px_30px_rgba(0,0,0,0.08)] px-4 py-0.5`}
        >
          <TooltipArrow className={`${arrowColor}`} />
          {tip}
        </Content>
      </Root>
    </Provider>
  )
}
