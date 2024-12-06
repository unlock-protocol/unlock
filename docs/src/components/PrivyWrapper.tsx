import React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'

const PrivyWrapper = ({ children }) => {
  return (
    <PrivyProvider
      config={{
        loginMethods: ['wallet'],
        // supportedChains
      }}
      appId="cm2oqudm203nny8z9ho6chvyv"
    >
      {children}
    </PrivyProvider>
  )
}

export default PrivyWrapper
