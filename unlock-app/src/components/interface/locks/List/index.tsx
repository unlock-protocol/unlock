'use client'
import { Lock } from '~/unlockTypes'
import { config } from '~/config/app'
import { Button, Placeholder } from '@unlock-protocol/ui'
import useLocksByManagerOnNetworks from '~/hooks/useLocksByManager'
import { ImageBar } from '../Manage/elements/ImageBar'
import { useCallback, useState } from 'react'
import { useAppStorage } from '~/hooks/useAppStorage'
import { LocksByNetwork } from './elements/LocksByNetwork'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSearchParams } from 'next/navigation'
import { Launcher } from '~/components/interface/Launcher'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useLockListData } from '~/hooks/useLockData'
import { FavoriteLocksSection } from './elements/FavoriteLocks'

export interface FavoriteLocks {
  [key: string]: boolean
}

const Description = ({
  onCreateLock,
  showCreateButton,
}: {
  onCreateLock: () => void
  showCreateButton: boolean
}) => {
  return (
    <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
      <span className="w-full max-w-lg text-base text-gray-700">
        A Lock is a membership smart contract you create, deploy, and own on
        Unlock Protocol
      </span>
      {showCreateButton && (
        <Button onClick={onCreateLock} className="md:auto" size="large">
          Create Lock
        </Button>
      )}
    </div>
  )
}

const StatusMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <ImageBar
      src="/images/illustrations/no-locks.svg"
      description={<span>{children}</span>}
    />
  )
}

const NoItems = () => {
  return <StatusMessage>You have not created any locks yet.</StatusMessage>
}

const filterLocksByNetwork = (locks: Lock[], network: number) => {
  return locks.filter((lock: Lock) => lock.network === network)
}

export const LockList = () => {
  const { account } = useAuthenticate()
  const searchParams = useSearchParams()
  const manager = searchParams.get('account')
  const owner = manager ?? account
  const [showLauncher, setShowLauncher] = useState(false)

  const { networks, defaultNetwork } = config
  const { getStorage, setStorage } = useAppStorage()

  // Filter networks to only include valid networks
  const networkItems = Object.entries(networks || {})
    .filter(([network]) => network || network === defaultNetwork.toString())
    .sort(([a], [b]) =>
      a === defaultNetwork.toString()
        ? -1
        : b === defaultNetwork.toString()
          ? 1
          : 0
    )

  const result = useLocksByManagerOnNetworks(owner, networkItems)

  // Get all locks first
  const allLocks = (result.data as unknown as Lock[]) || []

  // Fetch all lock data once at the parent level
  const { data: allLockData, isLoading: isLoadingLockData } =
    useLockListData(allLocks)

  const [favoriteLocks, setFavoriteLocks] = useState<FavoriteLocks>(() => {
    return getStorage('favoriteLocks') || {}
  })

  // Save favorite locks
  const saveFavoriteLocks = useCallback(
    (newFavoriteLocks: FavoriteLocks) => {
      setFavoriteLocks(newFavoriteLocks)
      setStorage('favoriteLocks', newFavoriteLocks)
    },
    [setStorage]
  )

  if (showLauncher) {
    return <Launcher />
  }

  const renderContent = () => {
    if (!networks) {
      return (
        <StatusMessage>
          Network configuration is missing. Please try again later.
        </StatusMessage>
      )
    }

    if (!owner) {
      return <WalletNotConnected />
    }

    const isLoading = result?.isLoading
    const hasError = result?.error

    if (hasError) {
      return (
        <StatusMessage>
          Failed to load locks. Please try again later.
        </StatusMessage>
      )
    }

    if (isLoading || isLoadingLockData) {
      return (
        <Placeholder.Root>
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
        </Placeholder.Root>
      )
    }

    const isEmpty = !isLoading && allLocks.length === 0

    return (
      <div className="grid gap-20 mb-20">
        <FavoriteLocksSection
          isLoading={isLoading}
          locks={allLocks}
          favoriteLocks={favoriteLocks}
          setFavoriteLocks={saveFavoriteLocks}
          lockData={allLockData}
        />
        {networkItems.map(([network]) => {
          const networkNumber = Number(network)
          const locksByNetwork = filterLocksByNetwork(allLocks, networkNumber)

          return (
            <LocksByNetwork
              isLoading={isLoading}
              key={network}
              network={networkNumber}
              locks={locksByNetwork}
              favoriteLocks={favoriteLocks}
              setFavoriteLocks={saveFavoriteLocks}
              lockData={allLockData}
            />
          )
        })}
        {isEmpty && <NoItems />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Locks</h1>
      <div className="w-full text-base text-gray-700">
        <Description
          onCreateLock={() => setShowLauncher(true)}
          showCreateButton={!!account}
        />
      </div>
      {renderContent()}
    </div>
  )
}
