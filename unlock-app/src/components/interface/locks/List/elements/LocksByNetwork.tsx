'use client'
import { Disclosure } from '@headlessui/react'
import { Lock } from '~/unlockTypes'
import { Placeholder } from '@unlock-protocol/ui'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'
import { LockCard } from './LockCard'
import { FavoriteLocks } from '..'
import { config } from '~/config/app'
import { LockData } from '~/hooks/useLockData'

interface LocksByNetworkProps {
  network: number | null
  isLoading: boolean
  locks?: Lock[]
  favoriteLocks: FavoriteLocks
  setFavoriteLocks: (favoriteLocks: FavoriteLocks) => void
  lockData: Record<string, LockData>
}

export const LocksByNetwork = ({
  network,
  isLoading,
  locks,
  favoriteLocks,
  setFavoriteLocks,
  lockData,
}: LocksByNetworkProps) => {
  const getNetworkName = (network: number) => {
    const { name: networkName } = config.networks[network]
    return networkName
  }

  // Ensure locks is always an array
  const safeLocks = locks || []

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  if (safeLocks.length === 0) return null

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
                {safeLocks.map((lock: Lock) => (
                  <LockCard
                    key={`${lock.address}-${network || lock.network}`}
                    lock={lock}
                    network={network ? network : lock.network}
                    favoriteLocks={favoriteLocks}
                    setFavoriteLocks={setFavoriteLocks}
                    lockData={lockData ? lockData[lock.address] : undefined}
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
