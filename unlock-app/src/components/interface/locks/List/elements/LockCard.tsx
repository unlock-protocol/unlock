import { useConfig } from '~/utils/withConfig'
import { useState } from 'react'
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
import { Card, Detail, Icon } from '@unlock-protocol/ui'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { PriceFormatter } from '@unlock-protocol/ui'
import {
  FaRegStar as FavoriteStar,
  FaStar as UnfavoriteStar,
} from 'react-icons/fa'
import { FavoriteLocks } from './LockList'
import { WrappedAddress } from '~/components/interface/WrappedAddress'

interface LockCardProps {
  lock: any
  network: number
  favoriteLocks: FavoriteLocks
  setFavoriteLocks: (favoriteLocks: FavoriteLocks) => void
}

interface LockIconProps {
  lock: Lock
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
        className="object-cover h-full aspect-1"
        src={imageSrc}
        onError={handleError}
      />
    </div>
  )
}

export const LockCard = ({
  lock,
  network,
  favoriteLocks,
  setFavoriteLocks,
}: LockCardProps) => {
  const { networks } = useConfig()
  const web3service = useWeb3Service()
  const tokenAddress = lock?.tokenAddress
  const lockAddress = lock?.address
  const baseCurrencySymbol = networks?.[network].nativeCurrency.symbol

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
    return ethers.formatUnits(lock?.price, decimals)
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

  const isFavorite = favoriteLocks[lockAddress] === true

  const setFavorite = () => {
    if (isFavorite) {
      const newFavoriteLocks = { ...favoriteLocks }
      delete newFavoriteLocks[lockAddress]
      setFavoriteLocks(newFavoriteLocks)
    } else {
      setFavoriteLocks({ ...favoriteLocks, [lockAddress]: true })
    }
  }

  const duration =
    lock?.expirationDuration === MAX_UINT ? (
      'Unlimited'
    ) : (
      <Duration seconds={lock?.expirationDuration} />
    )

  const isLoading = loadingBalance || loadingSymbol || loadingPrice

  return (
    <>
      <Card variant="simple" shadow="lg" padding="sm">
        <div className="grid items-center justify-between grid-cols-1 gap-7 md:gap-4 md:grid-cols-7">
          <div className="md:justify-start md:grid-cols-[56px_1fr] flex justify-around gap-3 md:col-span-3">
            <LockIcon lock={lock} />
            <div className="flex flex-col gap-2 w-1/3">
              <div className="flex gap-2">
                <span className="text-2xl font-bold">{lock.name}</span>
                <button onClick={setFavorite}>
                  {isFavorite ? (
                    <UnfavoriteStar size={20} />
                  ) : (
                    <FavoriteStar size={20} />
                  )}
                </button>
              </div>
              <WrappedAddress
                className="text-brand-dark"
                address={lock.address}
                network={network}
                addressType="lock"
              />
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
                <CryptoIcon symbol={symbol} />
                <span className="overflow-auto text-ellipsis">
                  <PriceFormatter price={keyPrice ?? ''} precision={2} />
                </span>
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
                <CryptoIcon symbol={symbol} />
                <span className="overflow-auto text-ellipsis">
                  <PriceFormatter price={balance ?? ''} precision={2} />
                </span>
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
                  <span>Key Minted</span>
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
      </Card>
    </>
  )
}
