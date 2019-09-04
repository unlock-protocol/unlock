import App, { Container } from 'next/app'
import React from 'react'
import configure from '../config'

import GlobalStyle from '../theme/globalStyle'
import { ConfigContext } from '../utils/withConfig'

import { WindowContext } from '../hooks/browser/useWindow'

const config = configure()

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
    const { Component, pageProps } = this.props

    return (
      <Container>
        <GlobalStyle />
        <WindowContext.Provider value={global.window}>
          <ConfigProvider value={config}>
            <Component {...pageProps} />
          </ConfigProvider>
        </WindowContext.Provider>
      </Container>
    )
  }
}

export default UnlockApp
