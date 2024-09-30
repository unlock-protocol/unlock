import { IconType } from 'react-icons'
import { ReactNode } from 'react'
import { Icon } from '@unlock-protocol/ui'

interface EventDetailProps {
  icon: IconType
  label: string
  children?: ReactNode
  compact?: boolean
}

export const EventDetail = ({
  label,
  icon,
  children,
  compact = false,
}: EventDetailProps) => {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-4">
      <div
        className={`flex ${compact ? 'w-12 h-12 min-w-12' : 'w-16 h-16 min-w-16'} bg-white border border-gray-200 rounded-2xl`}
      >
        <Icon className="m-auto" icon={icon} size={compact ? 24 : 32} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={`${compact ? 'text-base text-brand-ui-primary' : 'text-xl text-black'} font-bold`}
        >
          {label}
        </span>
        <div className={compact ? 'text-xs' : ''}>{children}</div>
      </div>
    </div>
  )
}
