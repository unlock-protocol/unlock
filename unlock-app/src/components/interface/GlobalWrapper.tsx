import React, { useState, useEffect } from 'react'
import { WedlockServiceContext } from '../../contexts/WedlocksContext'
import WedlockService from '../../services/wedlockService'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import Authenticate from './Authenticate'
import { config } from '~/config/app'
import { UnlockUIProvider } from '@unlock-protocol/ui'
import NextLink from 'next/link'
import { ReactNodeLike } from 'prop-types'
import { UNLOCK_CONSOLE_MESSAGE } from '@unlock-protocol/core'
const wedlockService = new WedlockService(config.services.wedlocks.host)

interface GlobalWrapperProps {
  children: ReactNodeLike
}

export const GlobalWrapper = ({ children }: GlobalWrapperProps) => {
  const [provider, setProvider] = useState<any>(null)
  useEffect(() => {
    /* eslint-disable no-console */
    console.info(UNLOCK_CONSOLE_MESSAGE)
    /* eslint-enable no-console */
  }, [])

  return (
    <UnlockUIProvider Link={NextLink}>
      <ConfigContext.Provider value={config}>
        <WedlockServiceContext.Provider value={wedlockService}>
          <ProviderContext.Provider value={{ provider, setProvider }}>
            <Authenticate>{children}</Authenticate>
          </ProviderContext.Provider>
        </WedlockServiceContext.Provider>
      </ConfigContext.Provider>
    </UnlockUIProvider>
  )
}

export default GlobalWrapper
