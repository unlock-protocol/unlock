import { Placeholder } from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'

interface LockIconProps {
  lockAddress: string
  network: number
  loading?: boolean
}

export const LockIcon = ({ lockAddress, loading }: LockIconProps) => {
  const config = useConfig()
  const imageSrc = lockAddress
    ? `${config.services.storage.host}/lock/${lockAddress}/icon`
    : '/images/svg/default-lock-logo.svg'

  if (loading) return <Placeholder.Image className="w-full h-40 md:h-80" />
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-white shadow-lg aspect-1 group rounded-xl">
      <img
        src={imageSrc!}
        alt="Lock image"
        className="object-cover w-full h-full"
      />
    </div>
  )
}
