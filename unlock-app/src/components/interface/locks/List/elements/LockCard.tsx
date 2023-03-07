import { useConfig } from '~/utils/withConfig'
import React, { useState } from 'react'
import { FiArrowRight as ArrowRightIcon } from 'react-icons/fi'
import { AiOutlineTag as TagIcon } from 'react-icons/ai'
import { IoMdTime as TimeIcon } from 'react-icons/io'
import { FiKey as KeyIcon } from 'react-icons/fi'
import Link from 'next/link'
import { Lock } from '~/unlockTypes'
import { DEFAULT_USER_ACCOUNT_ADDRESS, MAX_UINT } from '~/constants'
import Duration from '~/components/helpers/Duration'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQueries } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { AddressLink } from '~/components/interface/AddressLink'
import { Detail, Icon, CryptoIcon } from '@unlock-protocol/ui'
interface LockCardProps {
  lock: any
  network: number
}

interface LockIconProps {
  lock: Lock
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
  const [imageSrc, setImageSrc] = useState(
    lock.address
      ? `${config.services.storage.host}/lock/${lock.address}/icon`
      : '/images/svg/default-lock-logo.svg'
  )

  const handleError = () => {
    setImageSrc('/images/svg/default-lock-logo.svg')
  }

  return (
    <div className="relative block overflow-hidden rounded-full h-14 w-14 group">
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
  const { baseCurrencySymbol } = networks?.[network] ?? {}

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
    return await web3service.getTokenSymbol(tokenAddress, network)
  }

  const getKeyPrice = async () => {
    const decimals = await web3service.getTokenDecimals(tokenAddress, network)
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
          await getBalance(lockAddress, network, tokenAddress),
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
              <AddressLink lockAddress={lock.address} network={network} />
            </div>
          </div>
          <div className="grid items-center grid-cols-2 gap-3 md:grid-cols-4 md:col-span-3 md:gap-14">
            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={TagIcon} />
                  <span>Price</span>
                </div>
              }
              loading={isLoading}
              labelSize="tiny"
              valueSize="medium"
              truncate
            >
              <div className="flex items-center gap-2">
                <CryptoIcon id={symbol} />
                <span>{keyPrice}</span>
              </div>
            </Detail>

            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={TagIcon} />
                  <span>Balance</span>
                </div>
              }
              loading={isLoading}
              valueSize="medium"
              labelSize="tiny"
              truncate
            >
              <div className="flex items-center gap-2">
                <CryptoIcon id={symbol} />
                <span>{balance}</span>
              </div>
            </Detail>
            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={TimeIcon} />
                  <span>Key Duration</span>
                </div>
              }
              labelSize="tiny"
              valueSize="medium"
              truncate
            >
              {duration}
            </Detail>
            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={KeyIcon} />
                  <span>Key Sold</span>
                </div>
              }
              labelSize="tiny"
              valueSize="medium"
              truncate
            >
              {lock?.totalKeys}
            </Detail>
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
