import React, { useState } from 'react'
import { PaywallConfig } from '../../../unlockTypes'
import { CheckoutLoginSignup } from './CheckoutLoginSignup'
import { NotLoggedInLocks } from './NotLoggedInLocks'
import { LogInButton } from './LogInButton'
import { RecommendedWallets } from './RecommendWallets'

interface NotLoggedInProps {
  config: PaywallConfig
  lockAddresses: string[]
}

export const NotLoggedIn = ({ config, lockAddresses }: NotLoggedInProps) => {
  const [showingLogin, setShowingLogin] = useState(false)
  if (showingLogin) {
    return <CheckoutLoginSignup login />
  }

  if (config.unlockUserAccounts) {
    return (
      <>
        <NotLoggedInLocks lockAddresses={lockAddresses} />
        <LogInButton onClick={() => setShowingLogin(true)} />
      </>
    )
  }

  return <RecommendedWallets />
}
