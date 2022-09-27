import { addressMinify } from '~/utils/strings'
import { useConfig } from '~/utils/withConfig'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Button, Icon } from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'
import { FiArrowRight as ArrowRightIcon } from 'react-icons/fi'
import { AiOutlineTag as TagIcon } from 'react-icons/ai'
import { IoMdTime as TimeIcon } from 'react-icons/io'
import { FiKey as KeyIcon } from 'react-icons/fi'
import { IconType } from 'react-icons'
import Link from 'next/link'
import { Lock } from '~/unlockTypes'
import { UNLIMITED_KEYS_DURATION } from '~/constants'
import Duration from '~/components/helpers/Duration'
import { CryptoIcon } from '../../elements/KeyPrice'
import { IconModal } from '../../Manage/elements/LockIcon'
import { ImFilePicture as PictureFile } from 'react-icons/im'

interface LockCardProps {
  lock: Lock
  network: number
  isLoading?: boolean
}

interface DetailProps {
  label: string
  value?: string | React.ReactNode
  prepend?: React.ReactNode
  icon?: IconType
}

interface LockIconProps {
  lock: Lock
}

const Detail = ({ label, prepend, icon, value = '-' }: DetailProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {icon && <Icon icon={icon} size={10} />}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {prepend && <>{prepend}</>}
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  )
}

export const LockCardPlaceholder = () => {
  const DetailPlaceholder = () => {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <div className="w-4 h-3 animate-pulse bg-slate-200"></div>
          <div className="w-10 h-3 animate-pulse bg-slate-200"></div>
        </div>
        <div className="w-20 h-5 animate-pulse bg-slate-200"></div>
      </div>
    )
  }
  return (
    <div className="flex items-center h-24 px-12 py-4 bg-white rounded-2xl">
      <div className="flex items-center justify-between w-full grid-flow-col col-span-7 gap-4 ">
        <div className="flex col-span-3 gap-3">
          <div className="rounded-full bg-slate-200 animate-pulse h-14 w-14"></div>
          <div className="flex flex-col gap-2">
            <div className="h-6 w-52 animate-pulse bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-4 animate-pulse bg-slate-200"></div>
              <div className="w-4 h-4 animate-pulse bg-slate-200"></div>
              <div className="w-4 h-4 animate-pulse bg-slate-200"></div>
            </div>
          </div>
        </div>
        <div className="flex col-span-3 gap-14">
          <DetailPlaceholder />
          <DetailPlaceholder />
          <DetailPlaceholder />
        </div>
        <div className="col-span-1">
          <div className="w-6 h-6 animate-pulse bg-slate-200"></div>
        </div>
      </div>
    </div>
  )
}

const LockIcon = ({ lock }: LockIconProps) => {
  const config = useConfig()
  const [isOpen, setIsOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState(
    lock.address
      ? `${config.services.storage.host}/lock/${lock.address}/icon`
      : '/images/svg/default-lock-logo.svg'
  )

  const handleError = () => {
    setImageSrc('/images/svg/default-lock-logo.svg')
  }

  return (
    <div className="relative block overflow-hidden bg-gray-200 rounded-full cursor-pointer h-14 w-14 group">
      {lock.address && (
        <div
          className="absolute inset-0 flex items-center justify-center duration-500 bg-black opacity-0 group-hover:opacity-80"
          onClick={() => setIsOpen(true)}
        >
          <PictureFile
            className="text-white opacity-0 group-hover:opacity-100"
            size={20}
          />
        </div>
      )}
      <IconModal
        lockAddress={lock.address}
        network={lock.network}
        imageUrl={imageSrc}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        dismiss={(image: any) => {
          setIsOpen(false)
          setImageSrc(image)
        }}
      />
      <img
        alt="logo"
        className="object-cover w-full h-full"
        src={imageSrc}
        onError={handleError}
      />
    </div>
  )
}

export const LockCard = ({ lock, network, isLoading }: LockCardProps) => {
  const { networks } = useConfig()
  const lockAddress = lock.address
  const [isCopied, setCopied] = useClipboard(lockAddress, {
    successDuration: 2000,
  })

  const { explorer, baseCurrencySymbol } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(lockAddress) || '#'

  const symbol = (lock as any)?.currencySymbol ?? baseCurrencySymbol

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`Lock address copied`)
  }, [isCopied])

  const lockUrl = `/locks/lock?address=${lockAddress}&network=${network}`

  if (isLoading) return <LockCardPlaceholder />

  const duration =
    lock.expirationDuration === UNLIMITED_KEYS_DURATION ? (
      'Unlimited'
    ) : (
      <Duration seconds={lock.expirationDuration} />
    )

  return (
    <>
      <div className="px-12 py-4 bg-white shadow-lg rounded-2xl">
        <div className="grid items-center justify-between grid-cols-7 gap-4">
          <div className="flex col-span-3 gap-3">
            <LockIcon lock={lock} />
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-bold">{lock.name}</span>
              <div className="flex items-center gap-3">
                <span>{addressMinify(lockAddress)}</span>
                <Button
                  variant="transparent"
                  className="p-0 m-0"
                  onClick={setCopied}
                >
                  <CopyIcon size={20} />
                </Button>
                <a href={explorerUrl} target="_blank" rel="noreferrer">
                  <Button variant="transparent" className="p-0 m-0">
                    <ExternalLinkIcon
                      size={20}
                      className="text-brand-ui-primary"
                    />
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <div className="grid items-center grid-cols-4 col-span-3 gap-14">
            <div className="col-span-1">
              <Detail
                label="Price"
                value={lock.keyPrice}
                icon={TagIcon}
                prepend={<CryptoIcon symbol={symbol} size={20} />}
              />
            </div>
            <div className="col-span-2">
              <Detail label="Key Duration" value={duration} icon={TimeIcon} />
            </div>
            <div className="col-span-1">
              <Detail
                label="Key Sold"
                value={lock.outstandingKeys?.toString()}
                icon={KeyIcon}
              />
            </div>
          </div>
          <div className="col-span-1 ml-auto">
            <button>
              <Link href={lockUrl} aria-label="arrow right">
                <ArrowRightIcon size={20} />
              </Link>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
