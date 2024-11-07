import React from 'react'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useLegacyProvider } from '~/hooks/useLegacyProvider'
import { config } from '~/config/app'

interface AuthenticateProps {
  children: React.ReactNode
}

export const LegacyAuthWrapper = ({ children }: AuthenticateProps) => {
  const {
    network,
    account,
    email,
    encryptedPrivateKey,
    isUnlockAccount,
    watchAsset,
    providerSend,
    getWalletService,
    connected,
    displayAccount,
  } = useLegacyProvider(config)

  return (
    <AuthenticationContext.Provider
      value={{
        providerSend,
        account,
        network,
        email,
        encryptedPrivateKey,
        isUnlockAccount,
        watchAsset,
        getWalletService,
        connected,
        displayAccount,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}

export default LegacyAuthWrapper
