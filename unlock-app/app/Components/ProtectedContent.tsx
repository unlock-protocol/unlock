'use client'

import { ReactNode } from 'react'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface AuthRequiredProps {
  children: ReactNode
}

export function AuthRequired({ children }: AuthRequiredProps) {
  const { account } = useAuthenticate()

  if (!account) {
    return <WalletNotConnected />
  }

  return <>{children}</>
}
