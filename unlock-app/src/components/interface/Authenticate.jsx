import React, { createContext, useContext, useState, useMemo } from 'react'
import ApolloClient from 'apollo-boost'
import PropTypes from 'prop-types'
import { ApolloProvider } from '@apollo/react-hooks'
import { Web3Service, WalletService } from '@unlock-protocol/unlock-js'
import { StorageServiceContext } from '../../utils/withStorageService'
import { StorageService } from '../../services/storageService'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { WalletServiceContext } from '../../utils/withWalletService'
import { GraphServiceContext } from '../../utils/withGraphService'
import { GraphService } from '../../services/graphService'
import ProviderContext from '../../contexts/ProviderContext'

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

const GraphServiceProvider = GraphServiceContext.Provider

const StorageServiceProvider = StorageServiceContext.Provider
const Web3ServiceProvider = Web3ServiceContext.Provider

export const AuthenticationContext = createContext()

/**
 * Utility providers set to retrieve content based on network settings
 * @param {*} param0
 * @returns
 */
const Providers = ({ networkConfig, children }) => {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        uri: networkConfig.subgraphURI,
      }),
    [networkConfig]
  )

  const graphService = useMemo(
    () => new GraphService(networkConfig.subgraphURI),
    [networkConfig]
  )

  const storageService = useMemo(
    () => new StorageService(networkConfig.locksmith),
    [networkConfig]
  )

  const web3Service = useMemo(() => {
    return new Web3Service({
      ...networkConfig,
    })
  }, [networkConfig])

  return (
    <ApolloProvider client={apolloClient}>
      <StorageServiceProvider value={storageService}>
        <Web3ServiceProvider value={web3Service}>
          <GraphServiceProvider value={graphService}>
            {children}
          </GraphServiceProvider>
        </Web3ServiceProvider>
      </StorageServiceProvider>
    </ApolloProvider>
  )
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
  const { setProvider } = useContext(ProviderContext)

  const {
    loading,
    network,
    account,
    email,
    encryptedPrivateKey,
    walletService,
    connectProvider,
  } = useProvider(config)

  const authenticate = (provider, callback) => {
    if (!provider) {
      if (providerAdapter) {
        setProvider(providerAdapter)
        connectProvider(providerAdapter, callback)
        return
      }
    }
    connectProvider(provider, callback)
  }

  const networkConfig = {
    ...(config.networks[requiredNetwork || network] || {}),
    network,
  }

  return (
    <AuthenticationContext.Provider
      value={{ account, network, email, encryptedPrivateKey, authenticate }}
    >
      <WalletServiceContext.Provider value={walletService}>
        <Providers
          networkConfig={networkConfig}
          account={account}
          email={email}
          encryptedPrivateKey={encryptedPrivateKey}
        >
          {children}
        </Providers>
      </WalletServiceContext.Provider>
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
  onAuthenticated: () => {},
  providerAdapter: null,
}

export default Authenticate
