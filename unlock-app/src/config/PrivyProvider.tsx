import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'
import { config } from './app'

export const Privy = ({ children }: { children: ReactNode }) => {
  return (
    <PrivyProvider
      config={{
        loginMethods: ['wallet', 'email', 'google', 'farcaster'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // defaults to 'off'
        },
        appearance: {
          landingHeader: '',
        },
        // @ts-expect-error internal api
        _render: {
          standalone: true,
        },
      }}
      appId={config.privyAppId}
    >
      {children}
    </PrivyProvider>
  )
}

export default Privy
