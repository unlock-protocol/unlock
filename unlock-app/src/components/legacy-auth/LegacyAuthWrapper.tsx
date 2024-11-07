import React, { useContext, useMemo } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { ConfigContext } from '../../utils/withConfig'
import { SIWEProvider } from '~/hooks/useSIWE'
import { networks } from '@unlock-protocol/networks'
import { useLegacyProvider } from '~/hooks/useLegacyProvider'

const Web3ServiceProvider = Web3ServiceContext.Provider

interface ProvidersProps {
  children: any
}
/**
 * Utility providers set to retrieve content based on network settings
 * @returns
 */
const Providers = ({ children }: ProvidersProps) => {
  // TODO: remove this and the Web3ServiceProvider
  const web3Service = useMemo(() => {
    return new Web3Service(networks)
  }, [])

  return (
    <Web3ServiceProvider value={web3Service}>
      {web3Service && <>{children}</>}
    </Web3ServiceProvider>
  )
}

interface AuthenticateProps {
  children: React.ReactNode
  providerAdapter: any
}

export const LegacyAuthWrapper = ({
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
  } = useLegacyProvider(config)

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
          <SIWEProvider>{children}</SIWEProvider>
        </Providers>
      </WalletServiceContext.Provider>
    </AuthenticationContext.Provider>
  )
}

export default LegacyAuthWrapper
