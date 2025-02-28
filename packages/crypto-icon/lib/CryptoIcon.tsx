import { useMemo } from 'react'
import { Icons } from '~/@generated/icons'
import { getIconName } from '~/utils'
import React from 'react'

interface Props extends React.SVGProps<SVGSVGElement> {
  id: string
  size?: number
  fallbackId?: string
}

export const CustomIcon = ({
  id,
  size = 24,
  fallbackId = '',
  style,
  ...props
}: Props) => {
  const IconComponent = useMemo(() => {
    // Extra safety check for Icons
    if (!Icons) {
      return null
    }

    const IconComponents = Icons as unknown as Record<
      string,
      React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & {
          title?: string | undefined
        }
      >
    >
    const name = getIconName(id)
    const fallbackName = getIconName(fallbackId)

    // Try the primary icon, fallback, or return null if neither exists
    return (
      (name && IconComponents[name]) ||
      (fallbackName && IconComponents[fallbackName]) ||
      null
    )
  }, [id, fallbackId])

  // If we don't have a valid component, return null
  if (!IconComponent) {
    return null
  }

  // In React 19, we only need to use createElement instead of direct JSX for dynamic components
  try {
    return React.createElement(IconComponent, {
      height: size,
      width: size,
      style: {
        flexShrink: 0,
        ...style,
      },
      ...props,
    })
  } catch (error) {
    console.error(`Error rendering icon ${id}:`, error)
    return null
  }
}

export const CryptoIcon = ({
  symbol,
  size,
  fallbackId = 'crypto',
  ...props
}: Omit<Props, 'id'> & { symbol: string }) => {
  // Ensure symbol is valid before trying to render the icon
  if (!symbol) {
    // Use fallback icon
    return <CustomIcon id={fallbackId} size={size} {...props} />
  }
  return (
    <CustomIcon id={symbol} size={size} fallbackId={fallbackId} {...props} />
  )
}
