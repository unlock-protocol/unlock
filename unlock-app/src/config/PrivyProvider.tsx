import { saveAccessToken } from '~/utils/session'
import {
  getAccessToken as privyGetAccessToken,
  PrivyProvider,
  useLogin,
} from '@privy-io/react-auth'
import { ReactNode, useContext, useEffect } from 'react'
import { config } from './app'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from './locksmith'
import Cookies from 'universal-cookie'
import AuthenticationContext from '~/contexts/AuthenticationContext'

const cookies = new Cookies(null, { path: '/' })

// This method is meant to be called when the user is signed in with Privy,
// BUT NOT yet signed in with Locksmith and hence does not have an access token.
export const onSignedInWithPrivy = async () => {
  try {
    const accessToken = await privyGetAccessToken()
    const identityToken = cookies.get('privy-id-token')
    const response = await locksmith.loginWithPrivy({
      accessToken: accessToken!,
      identityToken: identityToken!,
    })
    const { accessToken: locksmithAccessToken, walletAddress } = response.data
    if (locksmithAccessToken && walletAddress) {
      saveAccessToken({
        accessToken: locksmithAccessToken,
        walletAddress,
      })
      window.dispatchEvent(
        new CustomEvent('locksmith.authenticated', { detail: walletAddress })
      )
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const PrivyChild = ({ children }: { children: ReactNode }) => {
  const { setAccount } = useContext<{
    setAccount: (account: string | undefined) => void
  }>(AuthenticationContext)

  useLogin({
    onComplete: onSignedInWithPrivy,
    onError: (error) => {
      if (error !== 'generic_connect_wallet_error') {
        ToastHelper.error(`Error while logging in: ${error}`)
      } else {
        ToastHelper.error('Error while logging in. Please retry!')
      }
      console.error(error)
    },
  })

  // Detects when login was succesul via an event
  // This should render only once!
  useEffect(() => {
    const onAuthenticated = async (event: any) => {
      setAccount(event.detail)
    }
    window.addEventListener('locksmith.authenticated', onAuthenticated)
    return () => {
      window.removeEventListener('locksmith.authenticated', onAuthenticated)
    }
  }, [])

  return children
}

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
      <PrivyChild>{children}</PrivyChild>
    </PrivyProvider>
  )
}

export default Privy
