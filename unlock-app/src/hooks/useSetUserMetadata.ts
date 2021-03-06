import { useContext } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'
import { UserMetadata } from '../unlockTypes'
import { AuthenticationContext } from '../components/interface/Authenticate'

interface Config {
  services: {
    storage: {
      host: string
    }
  }
}

export const useSetUserMetadata = () => {
  const { account } = useContext(AuthenticationContext)
  const walletService: WalletService = useContext(WalletServiceContext)
  const config: Config = useContext(ConfigContext)

  const setUserMetadata = (
    lockAddress: string,
    metadata: UserMetadata,
    callback: (error: Error, saved: boolean) => void
  ) => {
    try {
      walletService.setUserMetadata(
        {
          lockAddress,
          userAddress: account,
          metadata,
          locksmithHost: config.services.storage.host,
        },
        callback
      )
    } catch (error) {
      callback(
        new Error(
          'There was an error which prevented your data from being saved.'
        ),
        false
      )
    }
  }

  return { setUserMetadata }
}
