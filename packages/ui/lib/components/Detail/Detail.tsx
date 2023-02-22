import { Tooltip } from '../Tooltip/Tooltip'
import { IconType } from 'react-icons'
import { Icon } from '../Icon/Icon'
import { Size, SizeStyleProp } from '~/types'
import { twMerge } from 'tailwind-merge'

export interface DetailProps {
  label: string
  icon?: IconType
  iconSize?: number
  value?: React.ReactNode
  prepend?: React.ReactNode
  append?: React.ReactNode
  loading?: boolean
  inline?: boolean
  labelSize?: Size
  valueSize?: Size
  truncate?: boolean
}

const DetailValuePlaceholder = () => {
  return <div className="w-10 h-5 animate-pulse bg-slate-200"></div>
}

export const Detail = ({
  label,
  value,
  prepend,
  append,
  icon,
  labelSize = 'small',
  valueSize = 'small',
  iconSize = 10,
  loading = false,
  inline = false,
  truncate = false,
}: DetailProps) => {
  const LABEL_STYLES: SizeStyleProp = {
    tiny: 'text-xs',
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-2xl',
  }

  const VALUE_STYLES: SizeStyleProp = {
    tiny: 'text-base',
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-2xl md:text-4xl',
  }

  const labelClass = twMerge('text-gray-700', LABEL_STYLES[labelSize])
  const valueClass = twMerge(
    'cursor-pointer font-bold text-black',
    truncate ? 'truncate' : '',
    VALUE_STYLES[valueSize]
  )

  return (
    <div className={`flex ${inline ? 'justify-between' : 'flex-col gap-1'}`}>
      <div className="flex items-center gap-1">
        {icon && <Icon icon={icon} size={iconSize} />}
        <span className={labelClass}>{label}</span>
      </div>
      {loading ? (
        <DetailValuePlaceholder />
      ) : (
        <Tooltip tip={value} label={label} side="bottom">
          <div className="flex items-center gap-2 text-right">
            {prepend && <>{prepend}</>}
            <span className={valueClass}>{value ?? '-'}</span>
            {append && <>{append}</>}
          </div>
        </Tooltip>
      )}
    </div>
  )
}
