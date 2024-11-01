import React, { useState, useEffect } from 'react'
import { WedlockServiceContext } from '../../contexts/WedlocksContext'
import WedlockService from '../../services/wedlockService'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import AuthenticationContext from '../../contexts/AuthenticationContext'
import Authenticate from './Authenticate'
import { config } from '~/config/app'
import { UnlockUIProvider } from '@unlock-protocol/ui'
import NextLink from 'next/link'
import { UNLOCK_CONSOLE_MESSAGE } from '@unlock-protocol/core'
const wedlockService = new WedlockService(config.services.wedlocks.host)

interface GlobalWrapperProps {
  children: React.ReactNode
}

export const GlobalWrapper = ({ children }: GlobalWrapperProps) => {
  const [provider, setProvider] = useState<any>(null)
  const [account, setAccount] = useState<string | undefined>(undefined)

  useEffect(() => {
    console.info(UNLOCK_CONSOLE_MESSAGE)
  }, [])

  return (
    <UnlockUIProvider Link={NextLink}>
      <ConfigContext.Provider value={config}>
        <WedlockServiceContext.Provider value={wedlockService}>
          <AuthenticationContext.Provider value={{ account, setAccount }}>
            <ProviderContext.Provider value={{ provider, setProvider }}>
              <Authenticate>{children}</Authenticate>
            </ProviderContext.Provider>
          </AuthenticationContext.Provider>
        </WedlockServiceContext.Provider>
      </ConfigContext.Provider>
    </UnlockUIProvider>
  )
}

export default GlobalWrapper
