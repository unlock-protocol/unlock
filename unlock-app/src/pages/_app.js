import App from 'next/app'
import React from 'react'
import 'cross-fetch/polyfill'
import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import TagManager from 'react-gtm-module'
import configure from '../config'

import { ConfigContext } from '../utils/withConfig'
import { WedlockServiceContext } from '../contexts/WedlocksContext'
import WedlockService from '../services/wedlockService'
import ProviderContext from '../contexts/ProviderContext'
import GlobalWrapper from '../components/interface/GlobalWrapper'
import '../index.css'

const config = configure()
const wedlockService = new WedlockService(config.services.wedlocks.host)
class UnlockApp extends App {
  constructor(props, context) {
    super(props, context)

    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <GlobalWrapper pageProps={pageProps}>
        <Component {...pageProps} />
      </GlobalWrapper>
    )
  }
}

export default UnlockApp
