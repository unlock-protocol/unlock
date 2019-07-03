import App, { Container } from 'next/app'
import React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-next-router'
import configure from '../config'
import { createUnlockStore } from '../createUnlockStore'

import GlobalStyle from '../theme/globalStyle'
import { ConfigContext } from '../utils/withConfig'

import FullScreenModal from '../components/interface/FullScreenModals'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'

// Middlewares
import web3Middleware from '../middlewares/web3Middleware'
import currencyConversionMiddleware from '../middlewares/currencyConversionMiddleware'
import storageMiddleware from '../middlewares/storageMiddleware'
import walletMiddleware from '../middlewares/walletMiddleware'
import providerMiddleware from '../middlewares/providerMiddleware'
import wedlocksMiddleware from '../middlewares/wedlocksMiddleware'
import postOfficeMiddleware from '../middlewares/postOfficeMiddleware'

const config = configure()

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore(initialState, path) {
  const middlewares = [
    providerMiddleware(config),
    web3Middleware(config),
    currencyConversionMiddleware(config),
    walletMiddleware(config),
    wedlocksMiddleware(config),
    postOfficeMiddleware(window, config),
  ]

  if (config.services.storage) {
    middlewares.push(storageMiddleware(config))
  }

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

class UnlockApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

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

    return (
      <Container>
        <GlobalStyle />
        <Provider store={store}>
          <FullScreenModal />
          <ConnectedRouter>
            <ConfigProvider value={config}>
              <GlobalErrorConsumer>
                <Component {...pageProps} />
              </GlobalErrorConsumer>
            </ConfigProvider>
          </ConnectedRouter>
        </Provider>
      </Container>
    )
  }
}

export default UnlockApp
