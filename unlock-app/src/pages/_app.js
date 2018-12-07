import App, { Container } from 'next/app'
import React from 'react'
import { Provider } from 'react-redux'
import configure from '../config'
import GlobalStyle from '../theme/globalStyle'
import createUnlockStore from '../createUnlockStore'

const config = configure(global)

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore(initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (config.isServer) {
    return createUnlockStore(initialState)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = createUnlockStore(initialState)
  }
  return window[__NEXT_REDUX_STORE__]
}

const ConfigContext = React.createContext()

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
    const { Component, pageProps, router } = this.props
    const store = getOrCreateStore({})

    return (
      <Container>
        <GlobalStyle />
        <Provider store={store}>
          <ConfigContext.Provider value={config}>
            <Component {...pageProps} router={router} />
          </ConfigContext.Provider>
        </Provider>
      </Container>
    )
  }
}

export default UnlockApp
