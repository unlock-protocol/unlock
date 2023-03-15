import { useMemo } from 'react'
import { Icons } from '~/@generated/icons'
import { getIconName } from '~/utils'

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
  const Icon = useMemo(() => {
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
    const IdIcon = IconComponents[name]
    const FallbackIcon = IconComponents[fallbackName]
    return IdIcon || FallbackIcon
  }, [id])

  if (!Icon) {
    return null
  }
  return (
    <Icon
      height={size}
      width={size}
      style={{
        flexShrink: 0,
        ...style,
      }}
      {...props}
    />
  )
}

export const CryptoIcon = ({
  symbol,
  size,
  ...props
}: Omit<Props, 'id'> & { symbol: string }) => {
  return <CustomIcon id={symbol} size={size} fallbackId="crypto" {...props} />
}
