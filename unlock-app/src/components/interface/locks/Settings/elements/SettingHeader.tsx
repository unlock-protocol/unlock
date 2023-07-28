import { Button, Placeholder } from '@unlock-protocol/ui'
import { IoMdClose as CloseIcon } from 'react-icons/io'
import { useConfig } from '~/utils/withConfig'
import { Lock } from '@unlock-protocol/types'
import Link from 'next/link'
import { AddressLink } from '~/components/interface/AddressLink'

interface SettingHeaderProps {
  lockAddress: string
  network: number
  isLoading: boolean
  lock: Lock
}

export const SettingHeader = ({
  lockAddress,
  network,
  isLoading,
  lock,
}: SettingHeaderProps) => {
  const { services } = useConfig()

  const imageUrl = lockAddress
    ? `${services.storage.host}/lock/${lockAddress}/icon`
    : '/images/svg/default-lock-logo.svg'

  const version = `v${(lock as any)?.publicLockVersion}`
  const lockUrl = `/locks/lock?address=${lockAddress}&network=${network}`

  return (
    <div className="flex flex-col items-start gap-4 md:gap-10">
      <Link href={lockUrl}>
        <Button variant="borderless">
          <CloseIcon size={20} />
        </Button>
      </Link>
      {isLoading ? (
        <Placeholder.Root spaced="sm" className="w-full max-w-sm">
          <Placeholder.Line size="md" />
          <Placeholder.Root spaced="sm" inline>
            <Placeholder.Line size="sm" width="sm" />
            <Placeholder.Line size="sm" width="md" />
          </Placeholder.Root>
        </Placeholder.Root>
      ) : (
        <div className="flex gap-4">
          <div className="w-16 h-16 overflow-hidden bg-cover rounded-2xl">
            <img src={imageUrl} alt="" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-brand-dark">
              {lock?.name} / Lock Settings
            </span>
            <div className="flex gap-4">
              <div className="px-4 py-1 bg-lime-200 rounded-2xl">{version}</div>
              <AddressLink lockAddress={lock.address} network={network} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
