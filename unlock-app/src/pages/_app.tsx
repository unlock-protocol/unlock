import React, { useEffect } from 'react'
import 'cross-fetch/polyfill'
import type { AppProps } from 'next/app'
import TagManager from 'react-gtm-module'
import configure from '../config'
import GlobalWrapper from '../components/interface/GlobalWrapper'
import '../index.css'

const config = configure()
const UnlockApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }, [])

  return (
    <GlobalWrapper pageProps={pageProps}>
      <Component {...pageProps} />
    </GlobalWrapper>
  )
}

export default UnlockApp
