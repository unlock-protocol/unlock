'use client'
import { Disclosure } from '@headlessui/react'
import { config } from '~/config/app'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'
import { Placeholder } from '@unlock-protocol/ui'
import useLocksByManagerOnNetworks from '~/hooks/useLocksByManager'
import { ImageBar } from '../../Manage/elements/ImageBar'
import { useEffect, useMemo, useState } from 'react'
import { useAppStorage } from '~/hooks/useAppStorage'
import { EnhancedLockCard } from './EnhancedLockCard'

// Define the EnhancedLock type
export interface EnhancedLock {
  address: string
  name: string
  network: number
  keyPrice: string
  expirationDuration: number
  currencyContractAddress: string | null
  currencySymbol: string
  tokenSymbol?: string
  totalKeys?: number
  balance?: string
  lockManagers?: string[]
  version?: string
  [key: string]: any // Allow for additional properties
}

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

export interface FavoriteLocks {
  [key: string]: boolean
}

interface EnhancedLocksByNetworkProps {
  network: number | null
  locks: EnhancedLock[]
  isLoading: boolean
  favoriteLocks: FavoriteLocks
  setFavoriteLocks: (favoriteLocks: FavoriteLocks) => void
}

const EnhancedLocksByNetwork = ({
  network,
  locks,
  isLoading,
  favoriteLocks,
  setFavoriteLocks,
}: EnhancedLocksByNetworkProps) => {
  const { networks } = config

  const getNetworkName = (network: number) => {
    return networks[network]?.name || `Network #${network}`
  }

  // Count locks for this network
  const lockCount = locks.length

  // Skip rendering if no locks for this network
  if (lockCount === 0 && !isLoading) {
    return null
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <Disclosure defaultOpen>
          {() => (
            <>
              <Disclosure.Button className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4 text-left">
                <span className="text-lg font-bold text-brand-dark">
                  <Placeholder.Line width="md" />
                </span>
                <DownIcon className="h-8 w-8" aria-hidden="true" />
              </Disclosure.Button>
              <div className="mt-4">
                <Placeholder.Card size="md" />
              </div>
            </>
          )}
        </Disclosure>
      </div>
    )
  }

  // Render locks grouped by network
  return (
    <div className="mb-6">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4 text-left">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-brand-dark">
                  {getNetworkName(Number(network))}
                </span>
                <span className="text-sm text-brand-gray">
                  {lockCount} Lock{lockCount !== 1 && 's'}
                </span>
              </div>
              {open ? (
                <UpIcon className="h-8 w-8" aria-hidden="true" />
              ) : (
                <DownIcon className="h-8 w-8" aria-hidden="true" />
              )}
            </Disclosure.Button>
            <Disclosure.Panel>
              <div className="flex flex-col gap-6">
                {locks.map((lock: EnhancedLock, index: number) => (
                  <EnhancedLockCard
                    key={`${lock.address}-${index}`}
                    lock={lock}
                    network={Number(lock.network)}
                    favoriteLocks={favoriteLocks}
                    setFavoriteLocks={setFavoriteLocks}
                  />
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}

interface EnhancedLockListProps {
  owner: string
}

export const EnhancedLockList = ({ owner }: EnhancedLockListProps) => {
  const { networks, defaultNetwork } = config
  const { getStorage, setStorage } = useAppStorage()
  const [enhancedLocks, setEnhancedLocks] = useState<EnhancedLock[]>([])

  // Set up network items
  const networkItems = useMemo(() => {
    if (!networks) return []
    const networkEntries = Object.entries(networks)
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

  // Use the useLocksByManagerOnNetworks hook
  const [queryResult] = useLocksByManagerOnNetworks(owner, networkItems, 'list')

  const { data, isLoading, error } = queryResult || { isLoading: true }

  // Process locks when data is available
  useEffect(() => {
    if (!data) return

    // Safely access data.locks with type checking
    const locks =
      data &&
      typeof data === 'object' &&
      'locks' in data &&
      Array.isArray(data.locks)
        ? data.locks
        : []

    if (locks.length === 0) return

    // Process all locks at once for simplicity
    const processLocks = async () => {
      try {
        // Map locks to enhanced locks
        const processedLocks = locks.map((lock: any) => {
          const networkConfig = networks[lock.network]
          return {
            ...lock,
            network: Number(lock.network),
            currencySymbol: networkConfig?.nativeCurrency.symbol || '',
            // Add any other properties needed by EnhancedLockCard
          } as EnhancedLock
        })

        setEnhancedLocks(processedLocks)
      } catch (error) {
        console.error('Error processing locks:', error)
      }
    }

    processLocks()
  }, [data, networks])

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('Failed to load lock data:', error)
    }
  }, [error])

  // Load and manage favorite locks
  const [favoriteLocks, setFavoriteLocks] = useState<FavoriteLocks>(() => {
    try {
      const storedFavoriteLocks = getStorage('favoriteLocks')
      return storedFavoriteLocks ? JSON.parse(storedFavoriteLocks) : {}
    } catch (error) {
      console.error('Failed to load favorite locks from storage:', error)
      return {}
    }
  })

  // Save favorite locks to storage when they change
  useEffect(() => {
    try {
      setStorage('favoriteLocks', JSON.stringify(favoriteLocks))
    } catch (error) {
      console.error('Failed to save favorite locks to storage:', error)
    }
  }, [favoriteLocks, setStorage])

  // Group locks by network
  const locksByNetwork = useMemo(() => {
    const grouped: Record<number, EnhancedLock[]> = {}

    enhancedLocks.forEach((lock) => {
      const network = Number(lock.network)
      if (!grouped[network]) {
        grouped[network] = []
      }
      grouped[network].push(lock)
    })

    return grouped
  }, [enhancedLocks])

  // Render locks by network
  return (
    <div className="space-y-2">
      {isLoading && Object.keys(locksByNetwork).length === 0 ? (
        // Loading state
        <div className="flex flex-col gap-6">
          <Placeholder.Card size="md" />
          <Placeholder.Card size="md" />
        </div>
      ) : enhancedLocks.length > 0 ? (
        // Locks found
        Object.entries(locksByNetwork).map(([network, locks]) => (
          <EnhancedLocksByNetwork
            key={network}
            network={Number(network)}
            locks={locks}
            isLoading={isLoading}
            favoriteLocks={favoriteLocks}
            setFavoriteLocks={setFavoriteLocks}
          />
        ))
      ) : (
        // No locks found
        <NoItems />
      )}
    </div>
  )
}
