import { Lock } from '~/unlockTypes'
import { FavoriteLocks as FavoriteLockType } from '..'
import { LocksByNetwork } from './LocksByNetwork'
import { LockData } from '~/hooks/useLockData'

interface FavoriteLocksProps {
  isLoading: boolean
  locks: Lock[]
  favoriteLocks: FavoriteLockType
  setFavoriteLocks: (favoriteLocks: FavoriteLockType) => void
  lockData: Record<string, LockData>
}

export const FavoriteLocksSection = ({
  isLoading,
  locks,
  favoriteLocks,
  setFavoriteLocks,
  lockData,
}: FavoriteLocksProps) => {
  // Filter locks to only include favorites
  const favoritedLocks = locks.filter((lock) => favoriteLocks[lock.address])

  // If there are no favorite locks, don't render anything
  if (favoritedLocks.length === 0) return null

  return (
    <LocksByNetwork
      isLoading={isLoading}
      locks={favoritedLocks}
      favoriteLocks={favoriteLocks}
      setFavoriteLocks={setFavoriteLocks}
      network={null}
      lockData={lockData}
    />
  )
}
