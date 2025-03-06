import { Lock } from '~/unlockTypes'
import { config } from '~/config/app'
import { Placeholder } from '@unlock-protocol/ui'
import useLocksByManagerOnNetworks from '~/hooks/useLocksByManager'
import { ImageBar } from '../Manage/elements/ImageBar'
import { useCallback, useMemo, useState } from 'react'
import { useAppStorage } from '~/hooks/useAppStorage'
import { LocksByNetwork } from './elements/LocksByNetwork'

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

interface LockListProps {
  owner: string
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
  const result = results[0]

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

  const isLoading = result.isLoading
  const hasError = result.error

  if (hasError) {
    return (
      <div className="text-center text-red-500">
        Failed to load locks. Please try again later.
      </div>
    )
  }

  const allLocks = (result.data as Lock[]) || []
  const isEmpty = !isLoading && allLocks.length === 0

  return (
    <div className="grid gap-20 mb-20">
      <LocksByNetwork
        isLoading={isLoading}
        locks={allLocks.filter((item: Lock) => favoriteLocks[item.address])}
        favoriteLocks={favoriteLocks}
        setFavoriteLocks={saveFavoriteLocks}
        network={null}
      />
      {networkItems.map(([network]) => {
        const locksByNetwork = allLocks.filter(
          (lock: Lock) => lock.network === Number(network)
        )

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
