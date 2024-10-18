'use client'

import { usePrivy } from '@privy-io/react-auth'
import { ReactNode } from 'react'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuth } from '~/contexts/AuthenticationContext'

interface AuthRequiredProps {
  children: ReactNode
}

export function AuthRequired({ children }: AuthRequiredProps) {
  const { account } = useAuth()
  const { ready, authenticated } = usePrivy()

  if (!account || (!ready && !authenticated)) {
    return <WalletNotConnected />
  }

  return <>{children}</>
}
