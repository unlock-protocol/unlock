'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { ToastProvider } from '@unlock-protocol/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const Providers = ({ children }) => {
  return (
    <PrivyProvider
      config={{
        loginMethods: ['wallet'],
      }}
      appId="cm2oqudm203nny8z9ho6chvyv"
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default Providers
