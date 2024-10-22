import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

export const Privy = ({ children }: { children: ReactNode }) => {
  return (
    <PrivyProvider
      config={{
        loginMethods: ['email', 'wallet', 'google', 'apple', 'farcaster'],
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
      appId="cm0ptl8td04urb29fpotv9q9y"
    >
      {children}
    </PrivyProvider>
  )
}

export default Privy
