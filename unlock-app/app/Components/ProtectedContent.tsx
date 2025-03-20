'use client'

import { ReactNode } from 'react'
import { WalletNotConnected } from '~/components/interface/layouts/index/WalletNotConnected'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { LoadingIcon } from '~/components/interface/Loading'

interface AuthRequiredProps {
  children: ReactNode
}

export function AuthRequired({ children }: AuthRequiredProps) {
  const { account, isLoading } = useAuthenticate()

  if (isLoading) {
    return <LoadingIcon size={40} />
  }

  if (!account) {
    return <WalletNotConnected />
  }

  return <>{children}</>
}
