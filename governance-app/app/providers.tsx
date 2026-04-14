'use client'

import Link from 'next/link'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider, UnlockUIProvider } from '@unlock-protocol/ui'
import { useState } from 'react'
import { governanceEnv } from '~/config/env'
import { ConnectModalProvider } from '~/hooks/useConnectModal'

type ProviderProps = {
  children: React.ReactNode
}

function WalletProvider({ children }: ProviderProps) {
  return (
    <PrivyProvider
      appId={governanceEnv.privyAppId}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'farcaster'],
        embeddedWallets: {
          createOnLogin: 'off',
        },
        appearance: {
          landingHeader: '',
        },
        // @ts-expect-error internal api
        _render: {
          standalone: true,
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

export function Providers({ children }: ProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 5 * 60 * 1000,
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <UnlockUIProvider Link={Link}>
      <WalletProvider>
        <ConnectModalProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>{children}</ToastProvider>
          </QueryClientProvider>
        </ConnectModalProvider>
      </WalletProvider>
    </UnlockUIProvider>
  )
}
