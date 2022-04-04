/* eslint react/prop-types: 0 */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react'
import ApolloClient from 'apollo-boost'
import PropTypes, { number } from 'prop-types'
import { ApolloProvider } from '@apollo/react-hooks'
import { Web3Service, WalletService } from '@unlock-protocol/unlock-js'
import { StorageServiceContext } from '../../utils/withStorageService'
import { StorageService } from '../../services/storageService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { GraphServiceContext } from '../../utils/withGraphService'
import { GraphService } from '../../services/graphService'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useProvider } from '../../hooks/useProvider'
import Loading from './Loading'
import {
  NotEnabledInProvider,
  NetworkNotSupported,
  WrongNetwork,
} from '../creator/FatalError'
import { ConfigContext } from '../../utils/withConfig'
import UnlockPropTypes from '../../propTypes'

import LogInSignUp from './LogInSignUp'
import { useAutoLogin } from '../../hooks/useAutoLogin'

const GraphServiceProvider = GraphServiceContext.Provider

const StorageServiceProvider = StorageServiceContext.Provider
const Web3ServiceProvider = Web3ServiceContext.Provider

/**
 * Utility providers set to retrieve content based on network settings
 * @returns
 */
const Providers = ({ network, networkConfig, children, authenticate }) => {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        uri: networkConfig[network].subgraphURI,
      }),
    [networkConfig, network]
  )

  const graphService = useMemo(
    () => new GraphService(networkConfig[network].subgraphURI),
    [networkConfig, network]
  )

  const storageService = useMemo(
    () => new StorageService(networkConfig[network].locksmith),
    [networkConfig, network]
  )

  const web3Service = useMemo(() => {
    return new Web3Service(networkConfig)
  }, [networkConfig])

  const { tryAutoLogin, isLoading } = useAutoLogin({
    authenticate,
  })

  useEffect(() => {
    tryAutoLogin()
  }, [])
  return (
    <ApolloProvider client={apolloClient}>
      <StorageServiceProvider value={storageService}>
        <Web3ServiceProvider value={web3Service}>
          <GraphServiceProvider value={graphService}>
            {isLoading ? <Loading /> : children}
          </GraphServiceProvider>
        </Web3ServiceProvider>
      </StorageServiceProvider>
    </ApolloProvider>
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
    changeNetwork,
    watchAsset,
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
    disconnectProvider()
  }

  return (
    <AuthenticationContext.Provider
      value={{
        signMessage,
        account,
        network,
        email,
        encryptedPrivateKey,
        authenticate,
        isUnlockAccount,
        deAuthenticate,
        changeNetwork,
        watchAsset,
      }}
    >
      {error && <p>{error}</p>}
      {!error && (
        <WalletServiceContext.Provider value={walletService}>
          <Providers
            network={requiredNetwork || network}
            networkConfig={config.networks}
            account={account}
            email={email}
            encryptedPrivateKey={encryptedPrivateKey}
            authenticate={authenticate}
          >
            {children}
          </Providers>
        </WalletServiceContext.Provider>
      )}
    </AuthenticationContext.Provider>
  )
}

Authenticate.propTypes = {
  children: PropTypes.node.isRequired,
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
