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
  MissingProvider,
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

const Providers = ({
  networkConfig,
  network,
  account,
  email,
  encryptedPrivateKey,
  children,
}) => {
  const apolloClient = new ApolloClient({
    uri: networkConfig.subgraphURI,
  })
  const graphService = new GraphService(networkConfig.subgraphURI)
  const storageService = new StorageService(networkConfig.locksmith)

  const web3Service = new Web3Service({
    ...networkConfig,
    network,
  })

  return (
    <AuthenticationContext.Provider
      value={{ account, network, email, encryptedPrivateKey }}
    >
      <ApolloProvider client={apolloClient}>
        <StorageServiceProvider value={storageService}>
          <Web3ServiceProvider value={web3Service}>
            <GraphServiceProvider value={graphService}>
              {children}
            </GraphServiceProvider>
          </Web3ServiceProvider>
        </StorageServiceProvider>
      </ApolloProvider>
    </AuthenticationContext.Provider>
  )
}

export const AuthenticateWithProvider = ({
  children,
  config,
  provider,
  requiredNetwork,
  onAuthenticated,
}) => {
  const walletService = useMemo(() => new WalletService(config), [])
  const { loading, network, account, email, encryptedPrivateKey } = useProvider(
    provider,
    walletService
  )

  // Loading the provider
  if (loading || !network) {
    return <Loading />
  }

  // No account
  if (!account) {
    // No account, but we have a provider.
    // Let's ask the user to check their wallet!
    return <NotEnabledInProvider />
  }

  // Sometimes, we need a specific network (verifying an NFT for example!)
  if (requiredNetwork && parseInt(network) !== parseInt(requiredNetwork)) {
    return <WrongNetwork network={requiredNetwork} />
  }

  const networkConfig = config.networks[network]
  if (!networkConfig) {
    return <NetworkNotSupported />
  }

  onAuthenticated(account)
  walletService.setUnlockAddress(networkConfig.unlockAddress)

  return (
    <WalletServiceContext.Provider value={walletService}>
      <Providers
        networkConfig={networkConfig}
        network={network}
        account={account}
        email={email}
        encryptedPrivateKey={encryptedPrivateKey}
      >
        {children}
      </Providers>
    </WalletServiceContext.Provider>
  )
}

AuthenticateWithProvider.propTypes = {
  children: PropTypes.node.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  provider: PropTypes.object,
  requiredNetwork: PropTypes.string,
  onAuthenticated: PropTypes.func,
}

AuthenticateWithProvider.defaultProps = {
  provider: null,
  requiredNetwork: null,
  onAuthenticated: () => {},
}

export const AuthenticateWithoutProvider = ({
  onAuthenticated,
  network,
  config,
  children,
}) => {
  const walletService = useMemo(() => new WalletService(config), [])

  const networkConfig = config.networks[network]
  if (!networkConfig) {
    return <NetworkNotSupported />
  }
  walletService.setUnlockAddress(networkConfig.unlockAddress)

  return (
    <WalletServiceContext.Provider value={walletService}>
      <Providers networkConfig={networkConfig} network={network}>
        {children}
      </Providers>
    </WalletServiceContext.Provider>
  )
}

AuthenticateWithoutProvider.propTypes = {
  children: PropTypes.node.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  network: PropTypes.string.isRequired,
  onAuthenticated: PropTypes.func,
}

AuthenticateWithoutProvider.defaultProps = {
  onAuthenticated: () => {},
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
  const { provider, setProvider } = useContext(ProviderContext)

  if (!provider) {
    if (providerAdapter) {
      setProvider(providerAdapter)
      return null // ProviderContext will re-render
    }
    if (optional) {
      return (
        <AuthenticateWithoutProvider
          onAuthenticated={onAuthenticated}
          network={requiredNetwork}
          config={config}
        >
          {children}
        </AuthenticateWithoutProvider>
      )
    }
    if (!unlockUserAccount) {
      return <MissingProvider />
    }
    return (
      <LogInSignUp
        embedded={embedded}
        onCancel={onCancel}
        login
        onProvider={setProvider}
      />
    )
  }

  if (provider.isUnlock && !unlockUserAccount) {
    return <MissingProvider />
  }

  // Continue with provider!
  return (
    <ProviderContext.Provider value={provider}>
      <AuthenticateWithProvider
        requiredNetwork={requiredNetwork}
        config={config}
        provider={provider}
        onAuthenticated={onAuthenticated}
      >
        {children}
      </AuthenticateWithProvider>
    </ProviderContext.Provider>
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
