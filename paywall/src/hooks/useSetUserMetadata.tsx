import { useEffect, useState } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { UserMetadata } from '../unlockTypes'
import useConfig from './utils/useConfig'

export enum Status {
  NOT_SENT, // Default case
  IN_PROGRESS, // request initiated, hasn't resolved yet
  SUCCEEDED, // finished, metadata set
  FAILED, // finished, could not save metadata
}

export function useSetUserMetadata(
  lockAddress: string,
  userAddress: string,
  metadata: UserMetadata | undefined
) {
  const { unlockAddress, locksmithUri } = useConfig()
  const [status, setStatus] = useState(Status.NOT_SENT)
  const walletService = new WalletService({ unlockAddress })

  const callback = (error: any) => {
    if (error) {
      // TODO: surface error message?
      setStatus(Status.FAILED)
    } else {
      setStatus(Status.SUCCEEDED)
    }
  }

  useEffect(() => {
    if (!metadata) {
      return
    }
    setStatus(Status.IN_PROGRESS)

    walletService.setUserMetadata(
      {
        lockAddress,
        userAddress,
        locksmithHost: locksmithUri,
        metadata,
      },
      callback
    )
  }, [lockAddress, userAddress, metadata, walletService, locksmithUri])

  return { status }
}
