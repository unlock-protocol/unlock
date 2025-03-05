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
      appId="cm0ptl8td04urb29fpotv9q9y"
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default Providers
