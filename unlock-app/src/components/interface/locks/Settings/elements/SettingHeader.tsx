import { Button } from '@unlock-protocol/ui'
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

const SettingHeaderPlaceholder = () => {
  return (
    <div className="flex gap-4">
      <div className="w-16 h-16 overflow-hidden bg-cover rounded-2xl bg-slate-200 animate-pulse"></div>
      <div className="flex flex-col gap-1">
        <div className="w-56 h-6 bg-slate-200 animate-pulse"></div>
        <div className="flex gap-4">
          <div className="w-16 h-8 bg-slate-200 animate-pulse rounded-2xl "></div>
          <div className="flex items-center gap-3">
            <span className="h-5 w-44 bg-slate-200 animate-pulse"></span>
            <div className="w-5 h-5 bg-slate-200 animate-pulse"></div>
            <div className="w-5 h-5 bg-slate-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
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
        <SettingHeaderPlaceholder />
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
