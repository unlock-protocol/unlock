'use client'

import { Icon } from '@unlock-protocol/ui'
import { IconType } from 'react-icons'

interface PopoverItemProps {
  label: string
  description?: string
  icon?: IconType
  onClick?: any
}

const PopoverItem = ({
  label,
  description,
  icon,
  ...props
}: PopoverItemProps) => {
  return (
    <>
      <div className="flex gap-3 cursor-pointer" {...props}>
        {icon && (
          <div className="w-4 pt-1">
            <Icon className="text-brand-ui-primary" icon={icon} size={20} />
          </div>
        )}
        <div className="flex flex-col text-left">
          <span className="text-base font-bold text-brand-ui-primary">
            {label}
          </span>
          {description && (
            <span className="text-xs text-brand-dark">{description}</span>
          )}
        </div>
      </div>
    </>
  )
}

export default PopoverItem
