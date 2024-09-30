'use client'
import { Disclosure } from '@headlessui/react'
import { Lock } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { config } from '~/config/app'
import { LockCard } from './LockCard'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'
import { Placeholder } from '@unlock-protocol/ui'
import useLocksByManagerOnNetworks from '~/hooks/useLocksByManager'
import { ImageBar } from '../../Manage/elements/ImageBar'
import { useState, useMemo } from 'react'
import { useAppStorage } from '~/hooks/useAppStorage'

export const NoItems = () => {
  return (
    <ImageBar
      src="/images/illustrations/no-locks.svg"
      description={
        <>
          <span>You have not created any locks yet. </span>
        </>
      }
    />
  )
}

interface LocksByNetworkProps {
  network: number | null
  isLoading: boolean
  locks?: any[]
  favoriteLocks: FavoriteLocks
  setFavoriteLocks: (favoriteLocks: FavoriteLocks) => void
}

interface LockListProps {
  owner: string
}

const LocksByNetwork = ({
  network,
  isLoading,
  locks,
  favoriteLocks,
  setFavoriteLocks,
}: LocksByNetworkProps) => {
  const { networks } = useConfig()

  const getNetworkName = (network: number) => {
    const { name: networkName } = networks[network]
    return networkName
  }

  if (isLoading)
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  if (locks?.length === 0) return null

  return (
    <div className="w-full">
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="flex flex-col gap-2">
            <Disclosure.Button className="flex items-center justify-between w-full outline-none ring-0">
              <h2 className="text-lg font-bold text-brand-ui-primary">
                {network ? getNetworkName(network) : 'Favorite'}
              </h2>
              {open ? (
                <UpIcon className="fill-brand-ui-primary" size={24} />
              ) : (
                <DownIcon className="fill-brand-ui-primary" size={24} />
              )}
            </Disclosure.Button>
            <Disclosure.Panel>
              <div className="flex flex-col gap-6">
                {locks?.map((lock: Lock, index: number) => (
                  <LockCard
                    key={index}
                    lock={lock}
                    network={network ? network : lock.network}
                    favoriteLocks={favoriteLocks}
                    setFavoriteLocks={setFavoriteLocks}
                  />
                ))}
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}
export interface FavoriteLocks {
  [key: string]: boolean
}

export const LockList = ({ owner }: LockListProps) => {
  const { networks, defaultNetwork } = config
  const { getStorage, setStorage } = useAppStorage()

  const networkItems = useMemo(() => {
    if (!networks) return []
    const networkEntries = Object.entries(networks)
    // Sort networks so that default and preferred networks are first.
    return [
      ...networkEntries.filter(([network]) =>
        [defaultNetwork.toString()].includes(network)
      ),
      ...networkEntries.filter(
        ([network]) =>
          network && !['31337', defaultNetwork.toString()].includes(network)
      ),
    ]
  }, [networks, defaultNetwork])

  const results = useLocksByManagerOnNetworks(owner, networkItems)

  const [favoriteLocks, setFavoriteLocks] = useState<FavoriteLocks>(
    getStorage('favoriteLocks')
      ? JSON.parse(getStorage('favoriteLocks') as string)
      : {}
  )

  const saveFavoriteLocks = (favoriteLocks: FavoriteLocks) => {
    setFavoriteLocks(favoriteLocks)
    setStorage('favoriteLocks', favoriteLocks)
  }

  if (!networks || !owner) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  const isEmpty = results.reduce((previous: boolean, current: any) => {
    return !!(
      previous &&
      !current.isLoading &&
      current.data &&
      current.data.length === 0
    )
  }, true)

  return (
    <div className="grid gap-20 mb-20">
      <LocksByNetwork
        isLoading={
          results?.filter((element) => element.isLoading == true).length > 0
        }
        locks={results.flatMap(
          (result) =>
            (result?.data as any[])?.filter((item: any) =>
              favoriteLocks[item.address] ? true : false
            ) || []
        )}
        favoriteLocks={favoriteLocks}
        setFavoriteLocks={saveFavoriteLocks}
        network={null}
      />
      {networkItems.map(([network], index) => {
        const locksByNetwork: any = results?.[index]?.data || []
        const isLoading = results?.[index]?.isLoading || false

        return (
          <LocksByNetwork
            isLoading={isLoading}
            key={network}
            network={Number(network)}
            locks={locksByNetwork}
            favoriteLocks={favoriteLocks}
            setFavoriteLocks={saveFavoriteLocks}
          />
        )
      })}
      {isEmpty && <NoItems />}
    </div>
  )
}
