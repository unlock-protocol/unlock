import { addressMinify } from '~/utils/strings'
import { useConfig } from '~/utils/withConfig'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Button, Icon, Tooltip } from '@unlock-protocol/ui'
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
import { DEFAULT_USER_ACCOUNT_ADDRESS, MAX_UINT } from '~/constants'
import Duration from '~/components/helpers/Duration'
import { CryptoIcon } from '../../elements/KeyPrice'
import { IconModal } from '../../Manage/elements/LockIcon'
import { ImFilePicture as PictureFile } from 'react-icons/im'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQueries } from '@tanstack/react-query'
import { ethers } from 'ethers'

interface LockCardProps {
  lock: any
  network: string
}

interface DetailProps {
  label: string
  value?: string | React.ReactNode
  prepend?: React.ReactNode
  icon?: IconType
  isLoading?: boolean
}

interface LockIconProps {
  lock: Lock
}

const DetailPlaceholder = () => {
  return <div className="w-8 h-4 animate-pulse bg-slate-200"></div>
}

const Detail = ({
  label,
  prepend,
  icon,
  value = '-',
  isLoading,
}: DetailProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {icon && <Icon icon={icon} size={10} />}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {prepend && <div>{prepend}</div>}
        <Tooltip tip={value} label={label} side="bottom">
          {isLoading ? (
            <DetailPlaceholder />
          ) : (
            <span className="text-lg font-bold truncate">{value}</span>
          )}
        </Tooltip>
      </div>
    </div>
  )
}

export const LocksByNetworkPlaceholder = ({
  networkName,
}: {
  networkName: string
}) => {
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

  const LockCardPlaceHolder = () => {
    return (
      <div className="flex items-center px-12 py-4 bg-white md:h-24 rounded-2xl">
        <div className="grid items-center justify-between w-full grid-cols-1 gap-4 md:grid-cols-7">
          <div className="flex gap-7 md:gap-3 md:col-span-3">
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
          <div className="flex md:col-span-3 gap-14">
            <DetailPlaceholder />
            <DetailPlaceholder />
            <DetailPlaceholder />
          </div>
          <div className="flex justify-between gap-2 md:col-span-1 md:ml-auto">
            <div className="w-40 h-6 animate-pulse bg-slate-200 md:hidden"></div>
            <div className="w-6 h-6 animate-pulse bg-slate-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-brand-ui-primary">{networkName}</h2>
      <div className="flex flex-col gap-6">
        <LockCardPlaceHolder />
        <LockCardPlaceHolder />
        <LockCardPlaceHolder />
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

export const LockCard = ({ lock, network }: LockCardProps) => {
  const { networks } = useConfig()
  const web3service = useWeb3Service()
  const tokenAddress = lock?.tokenAddress
  const lockAddress = lock?.address
  const [isCopied, setCopied] = useClipboard(lockAddress, {
    successDuration: 2000,
  })
  const { explorer, baseCurrencySymbol } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(lockAddress) || '#'

  const getBalance = async (
    address: string,
    chainId: number,
    tokenAddress: string
  ) => {
    return await web3service.getAddressBalance(
      address,
      chainId,
      tokenAddress === DEFAULT_USER_ACCOUNT_ADDRESS ? undefined : tokenAddress
    )
  }

  const getSymbol = async () => {
    return await web3service.getTokenSymbol(
      tokenAddress,
      parseInt(network!, 10)
    )
  }

  const getKeyPrice = async () => {
    const decimals = await web3service.getTokenDecimals(
      tokenAddress,
      Number(network)
    )
    return ethers.utils.formatUnits(lock?.price, decimals)
  }

  const [
    { isLoading: loadingBalance, data: balance },
    { isLoading: loadingSymbol, data: tokenSymbol },
    { isLoading: loadingPrice, data: keyPrice },
  ] = useQueries({
    queries: [
      {
        queryKey: ['getBalance', lockAddress, network, tokenAddress],
        queryFn: async () =>
          await getBalance(lockAddress, parseInt(network, 10), tokenAddress),
      },
      {
        queryKey: ['getSymbol', lockAddress, network, tokenAddress],
        queryFn: async () => await getSymbol(),
      },
      {
        queryKey: ['getKeyPrice', lockAddress, network, tokenAddress],
        queryFn: async () => await getKeyPrice(),
      },
    ],
  })

  const symbol = tokenSymbol ?? baseCurrencySymbol

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`Lock address copied`)
  }, [isCopied])

  const lockUrl = `/locks/lock?address=${lockAddress}&network=${network}`

  const duration =
    lock?.expirationDuration === MAX_UINT ? (
      'Unlimited'
    ) : (
      <Duration seconds={lock?.expirationDuration} />
    )

  const isLoading = loadingBalance || loadingSymbol || loadingPrice

  return (
    <>
      <div className="px-12 py-4 bg-white shadow-lg rounded-2xl">
        <div className="grid items-center justify-between grid-cols-1 gap-7 md:gap-4 md:grid-cols-7">
          <div className="flex gap-3 md:col-span-3">
            <LockIcon lock={lock} />
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-bold">{lock.name}</span>
              <div className="flex items-center gap-3">
                <span>{addressMinify(lockAddress)}</span>
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
          <div className="grid items-center grid-cols-4 gap-3 md:col-span-3 md:gap-14">
            <Detail
              label="Price"
              value={keyPrice}
              icon={TagIcon}
              prepend={<CryptoIcon symbol={symbol} size={25} />}
              isLoading={isLoading}
            />
            <Detail
              label="Balance"
              value={balance}
              icon={TagIcon}
              prepend={<CryptoIcon symbol={symbol} size={25} />}
              isLoading={isLoading}
            />
            <Detail label="Key Duration" value={duration} icon={TimeIcon} />
            <Detail label="Key Sold" value={lock?.totalKeys} icon={KeyIcon} />
          </div>
          <div className="md:ml-auto md:col-span-1">
            <Link href={lockUrl} aria-label="arrow right">
              <button className="flex items-center justify-between w-full md:w-auto">
                <span className="text-base font-bold md:hidden">Manage</span>
                <ArrowRightIcon size={20} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
