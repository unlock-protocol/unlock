import React, { useState, useEffect } from 'react'
import GlobalStyle from '../../theme/globalStyle'
import { WedlockServiceContext } from '../../contexts/WedlocksContext'
import WedlockService from '../../services/wedlockService'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import Authenticate from './Authenticate'
import { CONSOLE_MESSAGE } from '../../constants'
import { config } from '~/config/app'

const wedlockService = new WedlockService(config.services.wedlocks.host)

interface GlobalWrapperProps {
  children: React.ReactNode
}

export const GlobalWrapper = ({ children }: GlobalWrapperProps) => {
  const [provider, setProvider] = useState<any>(null)
  useEffect(() => {
    console.info(CONSOLE_MESSAGE)
  }, [])

  return (
    <>
      <GlobalStyle />
      {children && (
        <ConfigContext.Provider value={config}>
          <WedlockServiceContext.Provider value={wedlockService}>
            <ProviderContext.Provider value={{ provider, setProvider }}>
              <Authenticate>{children}</Authenticate>
            </ProviderContext.Provider>
          </WedlockServiceContext.Provider>
        </ConfigContext.Provider>
      )}
    </>
  )
}

export default GlobalWrapper
