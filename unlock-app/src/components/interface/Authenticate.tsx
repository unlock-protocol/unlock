import React, { useMemo } from 'react'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useProvider } from '../../hooks/useProvider'
import { SIWEProvider } from '~/hooks/useSIWE'
import { Web3ServiceContext } from '~/utils/withWeb3Service'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

interface AuthenticateProps {
  children: React.ReactNode
}

export const Authenticate = ({ children }: AuthenticateProps) => {
  const web3Service = useMemo(() => {
    return new Web3Service(networks)
  }, [])
  const { account, watchAsset, getWalletService } = useProvider()

  return (
    <AuthenticationContext.Provider
      value={{
        account,
        watchAsset,
        getWalletService,
      }}
    >
      <Web3ServiceContext.Provider value={web3Service}>
        <SIWEProvider>{children}</SIWEProvider>
      </Web3ServiceContext.Provider>
    </AuthenticationContext.Provider>
  )
}

export default Authenticate
