import { Tooltip } from '../Tooltip/Tooltip'
import { IconType } from 'react-icons'
import { Icon } from '../Icon/Icon'
import { Size, SizeStyleProp } from '~/types'
import { Placeholder } from '../Placeholder'
import { classed } from '@tw-classed/react'

export interface DetailProps {
  label: React.ReactNode
  icon?: IconType
  iconSize?: number
  value?: React.ReactNode
  loading?: boolean
  inline?: boolean
  labelSize?: Size
  valueSize?: Size
  truncate?: boolean
}

export const Detail = ({
  label,
  value,
  icon,
  labelSize = 'small',
  valueSize = 'small',
  iconSize = 10,
  loading = false,
  inline = false,
  truncate = false,
}: DetailProps) => {
  const SizeMapping: SizeStyleProp = {
    tiny: 'sm',
    small: 'sm',
    medium: 'md',
    large: 'lg',
  }

  const Value = classed.span(
    `relative cursor-pointer font-bold text-black ${
      truncate ? 'truncate' : ''
    }`,
    {
      variants: {
        size: {
          tiny: 'text-base',
          small: 'text-base',
          medium: 'text-lg',
          large: 'text-2xl md:text-4xl',
        },
      },
      defaultVariants: {
        size: 'small',
      },
    }
  )

  const Label = classed.span('relative text-gray-700', {
    variants: {
      size: {
        tiny: 'text-xs',
        small: 'text-base',
        medium: 'text-lg',
        large: 'text-2xl',
      },
    },
    defaultVariants: {
      size: 'small',
    },
  })

  const placeHolderSize = SizeMapping?.[valueSize] ?? 'md'

  return (
    <div className={`flex ${inline ? 'justify-between' : 'flex-col gap-1'}`}>
      <div className="flex items-center gap-1">
        {icon && <Icon icon={icon} size={iconSize} />}
        <Label size={labelSize}>{label}</Label>
      </div>
      {loading ? (
        <Placeholder.Line
          size={placeHolderSize as any}
          width="sm"
          style={{
            borderRadius: '0',
            maxWidth: '150px',
          }}
        />
      ) : typeof label === 'string' ? (
        <Tooltip tip={value} label={label} side="bottom">
          <div className="flex items-center gap-2 text-right">
            <Value size={valueSize}>{value ?? '-'}</Value>
          </div>
        </Tooltip>
      ) : (
        <div className="flex items-center gap-2 text-right">
          <Value size={valueSize}>{value ?? '-'}</Value>
        </div>
      )}
    </div>
  )
}
