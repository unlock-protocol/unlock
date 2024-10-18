'use client'

import { ReactNode } from 'react'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuth } from '~/contexts/AuthenticationContext'

interface AuthRequiredProps {
  children: ReactNode
}

export function AuthRequired({ children }: AuthRequiredProps) {
  const { account } = useAuth()

  if (!account) {
    return <WalletNotConnected />
  }

  return <>{children}</>
}
