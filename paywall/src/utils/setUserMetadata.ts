import { WalletService } from '@unlock-protocol/unlock-js'
import { UserMetadata } from '../unlockTypes'
import configure from '../config'

export function setUserMetadata(
  lockAddress: string,
  userAddress: string,
  metadata: UserMetadata,
  callback: (error: any, value: any) => void
) {
  const { unlockAddress, locksmithUri } = configure()

  // TODO: investigate having a singleton WalletService to avoid any
  // instantiation overhead if we start to use it more frequently
  const walletService = new WalletService({ unlockAddress })
  walletService.setUserMetadata(
    {
      lockAddress,
      userAddress,
      locksmithHost: locksmithUri,
      metadata,
    },
    callback
  )
}

export default setUserMetadata
