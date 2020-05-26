import App from 'next/app'
import React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-next-router'
import 'cross-fetch/polyfill'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'
import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import configure from '../config'
import { createUnlockStore } from '../createUnlockStore'

import GlobalStyle from '../theme/globalStyle'
import { ConfigContext } from '../utils/withConfig'
import { GraphServiceContext } from '../utils/withGraphService'
import { WalletServiceContext } from '../utils/withWalletService'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { StorageServiceContext } from '../utils/withStorageService'
import { StorageService } from '../services/storageService'
import { GraphService } from '../services/graphService'
import { Web3ProviderContext } from '../hooks/useProvider'

import FullScreenModal from '../components/interface/FullScreenModals'

// Middlewares
import web3Middleware from '../middlewares/web3Middleware'
import storageMiddleware from '../middlewares/storageMiddleware'
import walletMiddleware from '../middlewares/walletMiddleware'
import providerMiddleware from '../middlewares/providerMiddleware'
import wedlocksMiddleware from '../middlewares/wedlocksMiddleware'

const config = configure()

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

const graphService = new GraphService(config.subgraphURI)

const walletService = new WalletService(config)
const {
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
  requiredNetworkId,
} = config
const web3Service = new Web3Service({
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
  network: requiredNetworkId,
})
const storageService = new StorageService(config.services.storage.host)

function getOrCreateStore(initialState, path) {
  const middlewares = [
    providerMiddleware(config, getWeb3Provider, setWeb3Provider),
    web3Middleware(web3Service),
    walletMiddleware(config, walletService, getWeb3Provider),
    wedlocksMiddleware(config),
    storageMiddleware(storageService),
  ]

  // Always make a new store if server, otherwise state is shared between requests
  if (config.isServer) {
    return createUnlockStore(initialState, middlewares, path)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = createUnlockStore(
      initialState,
      middlewares,
      path
    )
  }
  return window[__NEXT_REDUX_STORE__]
}

const ConfigProvider = ConfigContext.Provider
const GraphServiceProvider = GraphServiceContext.Provider
const WalletServiceProvider = WalletServiceContext.Provider
const Web3ServiceProvider = Web3ServiceContext.Provider
const StorageServiceProvider = StorageServiceContext.Provider
const Web3ProviderContextProvider = Web3ProviderContext.Provider

// web3 provider
let web3Provider = null
const setWeb3Provider = provider => {
  web3Provider = provider
}

const getWeb3Provider = () => {
  return web3Provider
}

class UnlockApp extends App {
  constructor(props, context) {
    super(props, context)

    if (!config.isServer) {
      /* eslint-disable no-console */
      console.info(`
*********************************************************************
Thanks for checking out Unlock!

We're building the missing payments layer for the web: a protocol
which enables creators to monetize their content with a few lines of
code in a fully decentralized way.

We would love your help.

Jobs: https://unlock-protocol.com/jobs

Open source community: https://github.com/unlock-protocol/unlock

Good first issues: https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

Get in touch: hello@unlock-protocol.com

Love,

The Unlock team
*********************************************************************`)
      /* eslint-enable no-console */
    }
  }

  render() {
    const {
      Component,
      pageProps,
      router: { asPath },
    } = this.props
    const store = getOrCreateStore({}, asPath)

    const client = new ApolloClient({
      uri: config.subgraphURI,
    })
    return (
      <ApolloProvider client={client}>
        <>
          <GlobalStyle />
          <Provider store={store}>
            <FullScreenModal />
            <ConnectedRouter>
              <Web3ProviderContextProvider
                value={{ getWeb3Provider, setWeb3Provider }}
              >
                <StorageServiceProvider value={storageService}>
                  <Web3ServiceProvider value={web3Service}>
                    <WalletServiceProvider value={walletService}>
                      <GraphServiceProvider value={graphService}>
                        <ConfigProvider value={config}>
                          <Component {...pageProps} />
                        </ConfigProvider>
                      </GraphServiceProvider>
                    </WalletServiceProvider>
                  </Web3ServiceProvider>
                </StorageServiceProvider>
              </Web3ProviderContextProvider>
            </ConnectedRouter>
          </Provider>
        </>
      </ApolloProvider>
    )
  }
}

export default UnlockApp
