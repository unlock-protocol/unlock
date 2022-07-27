import { Icon } from '@unlock-protocol/ui'
import { IconType } from 'react-icons'
import { twMerge } from 'tailwind-merge'

interface Props {
  label: string
  value: string
  icon?: IconType
}

export function LabeledItem({ icon, label, value }: Props) {
  const labeledItemClass = twMerge('flex items-center flex-wrap gap-2 text-sm')
  const labelClass = twMerge('text-gray-500', icon && 'hidden sm:block')
  return (
    <div className={labeledItemClass}>
      <div className="inline-flex items-center inset-0 relative gap-1">
        {icon && <Icon className="fill-gray-500 mb-[0.05rem]" icon={icon} />}
        <div className={labelClass}>{label}</div>
      </div>
      <div>{value}</div>
    </div>
  )
}
