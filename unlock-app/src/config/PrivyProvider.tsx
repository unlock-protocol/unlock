import { PrivyProvider, useLogin } from '@privy-io/react-auth'
import { ReactNode } from 'react'
import { config } from './app'
import { ToastHelper } from '~/components/helpers/toast.helper'

export const PrivyChild = ({ children }: { children: ReactNode }) => {
  useLogin({
    // onComplete: onSignedInWithPrivy,
    onComplete: () => {
      console.log('onComplete')
    },
    onError: (error) => {
      if (error !== 'generic_connect_wallet_error') {
        ToastHelper.error(`Error while logging in: ${error}`)
      } else {
        ToastHelper.error('Error while logging in. Please retry!')
      }
      console.error(error)
    },
  })
  return children
}

export const Privy = ({ children }: { children: ReactNode }) => {
  console.log('PrivyProvider rendered')
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
      <PrivyChild>{children}</PrivyChild>
    </PrivyProvider>
  )
}

export default Privy
