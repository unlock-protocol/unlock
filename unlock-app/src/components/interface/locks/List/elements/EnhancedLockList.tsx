'use client'
import { Disclosure } from '@headlessui/react'
import { useConfig } from '~/utils/withConfig'
import { config } from '~/config/app'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'
import { Placeholder } from '@unlock-protocol/ui'
import { useEnhancedLocksByManager } from '~/hooks/useLocksByManager'
import { ImageBar } from '../../Manage/elements/ImageBar'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useAppStorage } from '~/hooks/useAppStorage'
import { EnhancedLockCard } from './EnhancedLockCard'
import { EnhancedLock } from '~/hooks/useLocksByManager'
import { useConfig as useUnlockConfig } from '~/utils/withConfig'

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
  const { networks } = useConfig()

  const getNetworkName = (network: number) => {
    const { name: networkName } = networks[network]
    return networkName
  }

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  if (!locks || locks.length === 0) return null

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
                {locks.map((lock: EnhancedLock, index: number) => (
                  <EnhancedLockCard
                    key={`${lock.address}-${index}`}
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

interface EnhancedLockListProps {
  owner: string
}

export const EnhancedLockList = ({ owner }: EnhancedLockListProps) => {
  const { networks, defaultNetwork } = config
  const unlockConfig = useUnlockConfig()
  const { getStorage, setStorage } = useAppStorage()
  const [enhancedLocks, setEnhancedLocks] = useState<EnhancedLock[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Add a ref to keep track of the latest processing run
  const latestProcessIdRef = useRef<string | null>(null)

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

  const { data, isLoading, error } = useEnhancedLocksByManager(
    owner,
    networkItems
  )

  // Process locks as they come in (streaming approach)
  useEffect(() => {
    // Skip if already processing or no data
    if (isProcessing || !data || !data.locks || data.locks.length === 0) return

    // Reset state when data changes to avoid stale entries
    setEnhancedLocks([])
    setIsProcessing(true)

    // Process locks in batches to avoid blocking the UI
    const processLocks = async () => {
      const { locks, enhanceLock, networkItems } = data
      const batchSize = 5

      // Create a unique identifier for this processing run to avoid race conditions
      const processId = Date.now().toString()
      latestProcessIdRef.current = processId

      for (let i = 0; i < locks.length; i += batchSize) {
        // If another process has started, abort this one
        if (latestProcessIdRef.current !== processId) {
          console.log('Process aborted, newer process started')
          break
        }

        const batch = locks.slice(i, i + batchSize)
        const batchPromises = batch.map(async (lock) => {
          const networkConfig = unlockConfig.networks[lock.network]
          return await enhanceLock(lock, networkConfig)
        })

        // Process batch in parallel
        const batchResults = await Promise.all(batchPromises)

        // Make sure this is still the latest processing run before updating state
        if (latestProcessIdRef.current !== processId) break

        // Add batch results and update state to trigger rendering
        setEnhancedLocks((prev) => [...prev, ...batchResults])

        // Small delay to allow UI to render between batches
        if (i + batchSize < locks.length) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      // Only reset processing state if this is still the latest run
      if (latestProcessIdRef.current === processId) {
        setIsProcessing(false)
      }
    }

    // Use a try/catch to ensure we always reset isProcessing
    try {
      processLocks()
    } catch (error) {
      console.error('Error processing locks:', error)
      setIsProcessing(false)
    }

    // Cleanup function to abort processing if component unmounts or dependencies change
    return () => {
      latestProcessIdRef.current = null
      setIsProcessing(false)
    }
  }, [data, unlockConfig]) // Include unlockConfig but not isProcessing

  const [favoriteLocks, setFavoriteLocks] = useState<FavoriteLocks>(() => {
    return getStorage('favoriteLocks') || {}
  })

  const saveFavoriteLocks = useCallback(
    (newFavoriteLocks: FavoriteLocks) => {
      setFavoriteLocks(newFavoriteLocks)
      setStorage('favoriteLocks', newFavoriteLocks)
    },
    [setStorage]
  )

  if (!networks || !owner) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  const hasError = error
  const isLoadingOrProcessing = Boolean(
    isLoading ||
      (enhancedLocks.length === 0 && data?.locks && data.locks.length > 0)
  )

  if (hasError) {
    return (
      <div className="text-center text-red-500">
        Failed to load locks. Please try again later.
      </div>
    )
  }

  const isEmpty = !isLoadingOrProcessing && enhancedLocks.length === 0

  // Show favorite locks
  const favoriteLocksList = enhancedLocks.filter(
    (lock) => favoriteLocks[lock.address]
  )

  return (
    <div className="grid gap-20 mb-20">
      {/* Favorites section */}
      <EnhancedLocksByNetwork
        isLoading={isLoadingOrProcessing}
        locks={favoriteLocksList}
        favoriteLocks={favoriteLocks}
        setFavoriteLocks={saveFavoriteLocks}
        network={null}
      />

      {/* Locks by network */}
      {networkItems.map(([network]) => {
        const locksForNetwork = enhancedLocks.filter(
          (lock) => lock.network === Number(network)
        )

        return (
          <EnhancedLocksByNetwork
            key={network}
            isLoading={isLoadingOrProcessing}
            network={Number(network)}
            locks={locksForNetwork}
            favoriteLocks={favoriteLocks}
            setFavoriteLocks={saveFavoriteLocks}
          />
        )
      })}

      {isEmpty && <NoItems />}
    </div>
  )
}
