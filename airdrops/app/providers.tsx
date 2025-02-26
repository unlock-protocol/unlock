'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { ToastProvider } from '@unlock-protocol/ui'

const Providers = ({ children }) => {
  return (
    <PrivyProvider
      config={{
        loginMethods: ['wallet'],
      }}
      appId="cm2oqudm203nny8z9ho6chvyv"
    >
      <ToastProvider>{children}</ToastProvider>
    </PrivyProvider>
  )
}

export default Providers
