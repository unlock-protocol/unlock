import { IconType } from 'react-icons'
import { ReactNode } from 'react'
import { Icon } from '@unlock-protocol/ui'

interface EventDetailProps {
  icon: IconType
  label: string
  children?: ReactNode
}

export const EventDetail = ({ label, icon, children }: EventDetailProps) => {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-4">
      <div className="flex w-16 h-16 bg-white border border-gray-200 min-w-16 rounded-2xl">
        <Icon className="m-auto" icon={icon} size={32} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-bold text-black">{label}</span>
        <div>{children}</div>
      </div>
    </div>
  )
}
