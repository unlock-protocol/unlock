import React, { useState, useEffect, ReactNode } from 'react'
import { WedlockServiceContext } from '../../contexts/WedlocksContext'
import WedlockService from '../../services/wedlockService'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import Authenticate from './Authenticate'
import { CONSOLE_MESSAGE } from '../../constants'
import { config } from '~/config/app'
import { UnlockUIProvider } from '@unlock-protocol/ui'
import NextLink from 'next/link'
import Head from 'next/head'
const wedlockService = new WedlockService(config.services.wedlocks.host)
interface GlobalWrapperProps {
  children: ReactNode
}

export const GlobalWrapper = ({ children }: GlobalWrapperProps) => {
  const [provider, setProvider] = useState<any>(null)
  useEffect(() => {
    /* eslint-disable no-console */
    console.info(CONSOLE_MESSAGE)
    /* eslint-enable no-console */
  }, [])

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <UnlockUIProvider Link={NextLink}>
        <ConfigContext.Provider value={config}>
          <WedlockServiceContext.Provider value={wedlockService}>
            <ProviderContext.Provider value={{ provider, setProvider }}>
              <Authenticate>{children}</Authenticate>
            </ProviderContext.Provider>
          </WedlockServiceContext.Provider>
        </ConfigContext.Provider>
      </UnlockUIProvider>
    </>
  )
}

export default GlobalWrapper
