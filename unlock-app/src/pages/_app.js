import App from 'next/app'
import React from 'react'
import 'cross-fetch/polyfill'
import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import TagManager from 'react-gtm-module'
import configure from '../config'

import GlobalStyle from '../theme/globalStyle'
import { ConfigContext } from '../utils/withConfig'
import { WedlockServiceContext } from '../contexts/WedlocksContext'
import WedlockService from '../services/wedlockService'
import ProviderContext from '../contexts/ProviderContext'
import Authenticate from '../components/interface/Authenticate'

const config = configure()
const wedlockService = new WedlockService(config.services.wedlocks.host)

class UnlockApp extends App {
  constructor(props, context) {
    super(props, context)
    this.state = {
      provider: null,
    }

    if (!config.isServer) {
      // if (config.env === 'prod' && config.tagManagerArgs) {
      if (config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }

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

  setProvider = (_provider) => {
    this.setState({
      provider: _provider,
    })
  }

  render() {
    const { Component, pageProps } = this.props
    const { provider } = this.state
    return (
      <>
        <GlobalStyle />
        <ConfigContext.Provider value={config}>
          <WedlockServiceContext.Provider value={wedlockService}>
            <ProviderContext.Provider
              value={{ provider, setProvider: this.setProvider }}
            >
              <Authenticate>
                <Component {...pageProps} />
              </Authenticate>
            </ProviderContext.Provider>
          </WedlockServiceContext.Provider>
        </ConfigContext.Provider>
      </>
    )
  }
}

export default UnlockApp
