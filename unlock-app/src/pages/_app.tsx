import React, { useEffect } from 'react'
import 'cross-fetch/polyfill'
import type { AppProps } from 'next/app'
import TagManager from 'react-gtm-module'
import { Toaster } from 'react-hot-toast'
import configure from '../config'
import GlobalWrapper from '../components/interface/GlobalWrapper'
import '../index.css'

const config = configure()
const UnlockApp = ({ Component }: AppProps) => {
  useEffect(() => {
    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }, [])

  return (
    <GlobalWrapper>
      <Component />
      <Toaster />
    </GlobalWrapper>
  )
}

export default UnlockApp
