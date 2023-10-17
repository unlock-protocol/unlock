/* eslint react/prop-types: 0 */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react'
import PropTypes, { number } from 'prop-types'
import { Web3Service, WalletService } from '@unlock-protocol/unlock-js'
import { StorageServiceContext } from '../../utils/withStorageService'
import { StorageService } from '../../services/storageService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useProvider } from '../../hooks/useProvider'
import Loading from './Loading'
import { ConfigContext } from '../../utils/withConfig'
import UnlockPropTypes from '../../propTypes'
import { useAutoLogin } from '../../hooks/useAutoLogin'
import { SIWEProvider } from '~/hooks/useSIWE'
import { ConnectModalProvider } from '~/hooks/useConnectModal'
import { ConnectModal } from './connect'
import { config } from '~/config/app'

const StorageServiceProvider = StorageServiceContext.Provider
const Web3ServiceProvider = Web3ServiceContext.Provider

/**
 * Utility providers set to retrieve content based on network settings
 * @returns
 */
const Providers = ({ network, networkConfig, children, authenticate }) => {
  const storageService = useMemo(
    () => new StorageService(config.services.storage.host),
    []
  )

  const web3Service = useMemo(() => {
    return new Web3Service(networkConfig)
  }, [networkConfig])

  const { tryAutoLogin } = useAutoLogin({
    authenticate,
  })

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

Providers.propTypes = {
  network: number,
  // networkConfig: object.isRequired,
}

Providers.defaultProps = {
  network: 1, // defaults to mainnet (can we change this?)
}

export const Authenticate = ({
  children,
  unlockUserAccount,
  requiredNetwork,
  optional,
  onCancel,
  embedded,
  onAuthenticated,
  providerAdapter,
}) => {
  const config = useContext(ConfigContext)

  const {
    error,
    loading,
    network,
    signMessage,
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

  const authenticate = async (provider) => {
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
        signMessage,
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
        <Providers
          network={requiredNetwork || network}
          networkConfig={config.networks}
          account={account}
          email={email}
          encryptedPrivateKey={encryptedPrivateKey}
          authenticate={authenticate}
        >
          <SIWEProvider>
            {children}
            <ConnectModal />
          </SIWEProvider>
        </Providers>
      </WalletServiceContext.Provider>
    </AuthenticationContext.Provider>
  )
}

Authenticate.propTypes = {
  children: PropTypes.node,
  unlockUserAccount: PropTypes.bool,
  requiredNetwork: PropTypes.string,
  optional: PropTypes.bool,
  onCancel: PropTypes.func,
  embedded: PropTypes.bool,
  onAuthenticated: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  providerAdapter: PropTypes.object,
}

Authenticate.defaultProps = {
  unlockUserAccount: false,
  requiredNetwork: null,
  optional: false,
  onCancel: null,
  embedded: false,
  onAuthenticated: () => { },
  providerAdapter: null,
}

export default Authenticate
