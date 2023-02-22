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
  const LOADING_STYLES: SizeStyleProp = {
    tiny: 'w-10 h-3',
    small: 'w-10 h-5',
    medium: 'w-10 h-5',
    large: 'w-24 h-10',
  }
  const LABEL_STYLES: SizeStyleProp = {}

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
  const loadingClass = twMerge(
    'animate-pulse bg-slate-200',
    LOADING_STYLES[valueSize]
  )

  return (
    <div className={`flex ${inline ? 'justify-between' : 'flex-col gap-1'}`}>
      <div className="flex items-center gap-1">
        {icon && <Icon icon={icon} size={iconSize} />}
        <span className={labelClass}>{label}</span>
      </div>
      {loading ? (
        <div className={loadingClass}></div>
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
