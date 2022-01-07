import React, { useState, useEffect } from 'react'
import GlobalStyle from '../../theme/globalStyle'
import configure from '../../config'
import { WedlockServiceContext } from '../../contexts/WedlocksContext'
import WedlockService from '../../services/wedlockService'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import Authenticate from './Authenticate'

const config = configure()
const wedlockService = new WedlockService(config.services.wedlocks.host)

interface GlobalWrapperProps {
  children: React.ReactNode
  pageProps: any
}

export const GlobalWrapper = ({ children, pageProps }: GlobalWrapperProps) => {
  const [provider, setProvider] = useState<any>(null)
  useEffect(() => {
    /* eslint-disable no-console */
    console.info(`
*********************************************************************
Thanks for checking out Unlock!

We're building the missing payments layer for the web: a protocol
which enables creators to monetize their content with a few lines of
code in a fully decentralized way.

We would love your help.

Jobs: https://unlock-protocol.com/jobs

Get in touch: hello@unlock-protocol.com

Love,

The Unlock team
*********************************************************************`)
    /* eslint-enable no-console */
  }, [])

  return (
    children && (
      <>
        <GlobalStyle />
        <ConfigContext.Provider value={config}>
          <WedlockServiceContext.Provider value={wedlockService}>
            <ProviderContext.Provider value={{ provider, setProvider }}>
              <Authenticate skipAutoLogin={pageProps.skipAutoLogin}>
                {children}
              </Authenticate>
            </ProviderContext.Provider>
          </WedlockServiceContext.Provider>
        </ConfigContext.Provider>
      </>
    )
  )
}

export default GlobalWrapper
