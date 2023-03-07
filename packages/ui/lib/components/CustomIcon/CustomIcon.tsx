import { useMemo } from 'react'
import { SvgIcon } from '~/icons'
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
  ...props
}: Props) => {
  const Icon = useMemo(() => {
    const SvgIcons = SvgIcon as unknown as Record<
      string,
      React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & {
          title?: string | undefined
        }
      >
    >
    const name = getIconName(id)
    const fallbackName = getIconName(fallbackId)
    const IdIcon = SvgIcons[name]
    const FallbackIcon = SvgIcons[fallbackName]
    return IdIcon || FallbackIcon
  }, [id])

  if (!Icon) {
    return null
  }
  return <Icon height={size} width={size} {...props} />
}

export const CryptoIcon = ({ id, size, ...props }: Props) => {
  return <CustomIcon id={id} size={size} fallbackId="crypto" {...props} />
}
