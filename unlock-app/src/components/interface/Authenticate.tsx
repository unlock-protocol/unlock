import React, { useContext, useMemo, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { StorageServiceContext } from '../../utils/withStorageService'
import { StorageService } from '../../services/storageService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useProvider } from '../../hooks/useProvider'
import { ConfigContext } from '../../utils/withConfig'
import { useAutoLogin } from '../../hooks/useAutoLogin'
import { SIWEProvider } from '~/hooks/useSIWE'
import { ConnectModal } from './connect'
import { config } from '~/config/app'
import { networks } from '@unlock-protocol/networks'

const StorageServiceProvider = StorageServiceContext.Provider
const Web3ServiceProvider = Web3ServiceContext.Provider

interface ProvidersProps {
  children: any
}
/**
 * Utility providers set to retrieve content based on network settings
 * @returns
 */
const Providers = ({ children }: ProvidersProps) => {
  const storageService = useMemo(
    () => new StorageService(config.services.storage.host),
    []
  )

  // TODO: remove this and the Web3ServiceProvider
  const web3Service = useMemo(() => {
    return new Web3Service(networks)
  }, [])

  const { tryAutoLogin } = useAutoLogin()

  useEffect(() => {
    tryAutoLogin()
  }, [])

  return (
    <StorageServiceProvider value={storageService}>
      <Web3ServiceProvider value={web3Service}>
        {web3Service && <>{children}</>}
      </Web3ServiceProvider>
    </StorageServiceProvider>
  )
}

interface AuthenticateProps {
  children: React.ReactNode
  providerAdapter: any
}

export const Authenticate = ({
  children,
  providerAdapter,
}: AuthenticateProps) => {
  const config = useContext(ConfigContext)

  const {
    network,
    account,
    email,
    encryptedPrivateKey,
    walletService,
    connectProvider,
    disconnectProvider,
    isUnlockAccount,
    watchAsset,
    providerSend,
    getWalletService,
    connected,
    displayAccount,
  } = useProvider(config)

  const authenticate = async (provider: any) => {
    if (!provider) {
      if (providerAdapter) {
        return connectProvider(providerAdapter)
      }
    }
    return connectProvider(provider)
  }

  const deAuthenticate = () => {
    return disconnectProvider()
  }

  return (
    <AuthenticationContext.Provider
      value={{
        providerSend,
        account,
        network,
        email,
        encryptedPrivateKey,
        authenticate,
        isUnlockAccount,
        deAuthenticate,
        watchAsset,
        getWalletService,
        connected,
        displayAccount,
      }}
    >
      <WalletServiceContext.Provider value={walletService}>
        <Providers>
          <SIWEProvider>
            {children}
            <ConnectModal />
          </SIWEProvider>
        </Providers>
      </WalletServiceContext.Provider>
    </AuthenticationContext.Provider>
  )
}

export default Authenticate
