import { Switch } from '@headlessui/react'
import { classed } from '@tw-classed/react'
import { ButtonHTMLAttributes } from 'react'
import { Size } from '~/types'

interface Props
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'size' | 'ref' | 'children' | 'value' | 'onChange'
  > {
  value: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
  size?: Extract<Size, 'small' | 'medium'>
}

const ToggleButton = classed.button(
  'relative disabled:opacity-50 inline-flex  items-center rounded-full',
  {
    variants: {
      size: {
        small: 'h-6 w-11',
        medium: 'h-7 w-12',
      },
      enabled: {
        true: 'bg-ui-main-500',
        false: 'bg-gray-400',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  }
)

const ToggleButtonThumb = classed.span(
  `inline-block transform rounded-full bg-white transition`,
  {
    variants: {
      size: {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
      },
      enabled: {
        true: 'translate-x-6',
        false: 'translate-x-1',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  }
)

export const Toggle = ({
  onChange,
  value,
  disabled,
  size = 'medium',
  ...rest
}: Props) => {
  return (
    <Switch
      disabled={disabled}
      checked={value}
      size={size}
      onChange={onChange}
      as={ToggleButton}
      enabled={value}
      {...rest}
    >
      <ToggleButtonThumb size={size} enabled={value} />
    </Switch>
  )
}
