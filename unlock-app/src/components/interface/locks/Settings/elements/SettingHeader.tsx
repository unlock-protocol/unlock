import { Button } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { addressMinify } from '~/utils/strings'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { IoMdClose as CloseIcon } from 'react-icons/io'
import { useConfig } from '~/utils/withConfig'
import { Lock } from '@unlock-protocol/types'
import Link from 'next/link'

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
  const { networks, services } = useConfig()
  const [isCopied, setCopied] = useClipboard(lockAddress, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`Lock address copied`)
  }, [isCopied])

  const { explorer } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(lockAddress) || '#'
  const imageUrl = lockAddress
    ? `${services.storage.host}/lock/${lockAddress}/icon`
    : '/images/svg/default-lock-logo.svg'

  const version = `v${(lock as any)?.publicLockVersion}`
  const lockUrl = `/locks/lock?address=${lockAddress}&network=${network}`

  return (
    <div className="flex flex-col items-start gap-10">
      <Link href={lockUrl}>
        <Button variant="borderless">
          <CloseIcon size={20} />
        </Button>
      </Link>
      {isLoading ? (
        <SettingHeaderPlaceholder />
      ) : (
        <div className="flex gap-4">
          <div className="w-16 h-16 overflow-hidden bg-cover rounded-2xl bg-slate-200">
            <img src={imageUrl} alt="" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-brand-dark">
              {lock?.name} / Lock Settings
            </span>
            <div className="flex gap-4">
              <div className="px-4 py-1 bg-lime-200 rounded-2xl">{version}</div>
              <div className="flex items-center gap-3">
                <span className="text-brand-dark">
                  {addressMinify(lockAddress)}
                </span>
                <Button variant="borderless" onClick={setCopied}>
                  <CopyIcon size={20} />
                </Button>
                <a href={explorerUrl} target="_blank" rel="noreferrer">
                  <Button variant="borderless">
                    <ExternalLinkIcon
                      size={20}
                      className="text-brand-ui-primary"
                    />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
