import React from 'react'
import { PaywallConfig } from '../../../unlockTypes'
import { CheckoutLoginSignup } from './CheckoutLoginSignup'
import { NotLoggedInLocks } from './NotLoggedInLocks'
import { LogInButton } from './LogInButton'
import { RecommendedWallets } from './RecommendWallets'

interface NotLoggedInProps {
  config: PaywallConfig
  showingLogin: boolean
  lockAddresses: string[]
  showLogin: () => void
}

export const NotLoggedIn = ({
  showingLogin,
  config,
  lockAddresses,
  showLogin,
}: NotLoggedInProps) => {
  if (showingLogin) {
    return <CheckoutLoginSignup login />
  }

  if (config.unlockUserAccounts) {
    return (
      <>
        <NotLoggedInLocks lockAddresses={lockAddresses} />
        <LogInButton onClick={showLogin} />
      </>
    )
  }

  return <RecommendedWallets />
}
