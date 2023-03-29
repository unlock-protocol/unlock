import { Tooltip } from '../Tooltip/Tooltip'
import { Size, SizeStyleProp } from '~/types'
import { Placeholder } from '../Placeholder'
import { classed } from '@tw-classed/react'
import { BaseHTMLAttributes } from 'react'

export interface DetailProps
  extends Pick<BaseHTMLAttributes<HTMLDivElement>, 'className'> {
  label: React.ReactNode
  children?: React.ReactNode
  loading?: boolean
  inline?: boolean
  labelSize?: Size
  valueSize?: Size
  truncate?: boolean
  tooltip?: boolean
  justify?: boolean
}

const Wrapper = classed.div('flex gap-1', {
  variants: {
    inline: {
      false: 'flex-col',
      true: 'md:items-center',
    },
    justify: {
      true: 'justify-between',
    },
  },
  defaultVariants: {
    inline: false,
    justify: true,
  },
})

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

const Value = classed.span(`relative font-bold text-black`, {
  variants: {
    size: {
      tiny: 'text-base',
      small: 'text-base',
      medium: 'text-lg',
      large: 'text-2xl md:text-4xl',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: {
    size: 'small',
  },
})

export const Detail = ({
  label,
  children,
  labelSize = 'small',
  valueSize = 'small',
  loading = false,
  inline = false,
  truncate = false,
  tooltip = false,
  justify = true,
  className,
}: DetailProps) => {
  const SizeMapping: SizeStyleProp = {
    tiny: 'sm',
    small: 'sm',
    medium: 'md',
    large: 'lg',
  }

  const placeHolderSize = SizeMapping?.[valueSize] ?? 'md'

  return (
    <Wrapper inline={inline} justify={justify} className={className}>
      <Label size={labelSize}>{label}</Label>
      {loading ? (
        <Placeholder.Line
          size={placeHolderSize as any}
          width="sm"
          style={{
            borderRadius: '0',
            maxWidth: '150px',
          }}
        />
      ) : (
        children !== undefined &&
        (typeof label === 'string' && tooltip ? (
          <Tooltip tip={children} label={label} side="bottom">
            <div className="flex items-center gap-2 text-right">
              <Value truncate={truncate} size={valueSize}>
                {children}
              </Value>
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2 text-right cursor-pointer">
            <Value truncate={truncate} size={valueSize}>
              {children}
            </Value>
          </div>
        ))
      )}
    </Wrapper>
  )
}
