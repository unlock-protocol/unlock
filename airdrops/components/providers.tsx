'use client'

import { PrivyProvider } from '@privy-io/react-auth'

const Providers = ({ children }) => {
  return (
    <PrivyProvider
      config={{
        loginMethods: ['wallet'],
      }}
      appId="cm2oqudm203nny8z9ho6chvyv"
    >
      {children}
    </PrivyProvider>
  )
}

export default Providers
