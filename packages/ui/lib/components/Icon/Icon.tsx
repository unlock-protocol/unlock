import { IconType } from 'react-icons'
import { IconBaseProps } from 'react-icons/lib'
import { Size } from '~/types'

export interface Props extends IconBaseProps {
  size?: Size | number
  icon: IconType
}

const ICON_SIZE: Record<Size, number> = {
  large: 20,
  medium: 18,
  small: 16,
  tiny: 14,
}

// Regular implementation
function IconComponent({ className, size = 'small', icon, ...rest }: Props) {
  const IconComponent = icon
  const iconSize: number = typeof size === 'string' ? ICON_SIZE[size] : size
  return <IconComponent className={className} size={iconSize} {...rest} />
}

// For React 19, we need to use a more direct approach with "any" casting
// Using "any" is necessary here to make components usable as JSX elements in React 19
// This also solves the IconType incompatibility between different package installations
export const Icon = IconComponent as any
