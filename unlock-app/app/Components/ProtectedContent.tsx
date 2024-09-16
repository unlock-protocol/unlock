'use client'

import { ReactNode } from 'react'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuth } from '~/contexts/AuthenticationContext'

interface ProtectedContentProps {
  children: ReactNode
}

export function ProtectedContent({ children }: ProtectedContentProps) {
  const { account } = useAuth()

  if (!account) {
    return <WalletNotConnected />
  }

  return <>{children}</>
}
