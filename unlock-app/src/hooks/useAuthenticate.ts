import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useAppStorage } from './useAppStorage'
import { useContext, useEffect } from 'react'
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from '~/utils/session'
import { locksmith } from '~/config/locksmith'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from './useSession'
import { useSIWE } from './useSIWE'
import { useCookies } from 'react-cookie'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useProvider } from './useProvider'
import AuthenticationContext from '~/contexts/AuthenticationContext'

let executingOnSignedInWithPrivy = false
// This hook includes *all* signIn and signOut methods
// TODO: consider adding useSession() stuff here too?
export function useAuthenticate() {
  const { account, setAccount } = useContext<{
    account: string | undefined
    setAccount: (account: string | undefined) => void
  }>(AuthenticationContext)
  const { setProvider } = useProvider()
  const [cookies] = useCookies()
  const { refetchSession } = useSession()
  const { setStorage } = useAppStorage()
  const {
    logout: privyLogout,
    getAccessToken: privyGetAccessToken,
    ready: privyReady,
    authenticated: privyAuthenticated,
    user,
  } = usePrivy()
  const queryClient = useQueryClient()
  const { siweSign } = useSIWE()
  const { wallets } = useWallets()

  // This method is meant to be called when the user is signed in with Privy,
  // BUT NOT yet signed in with Locksmith and hence does not have an access token.
  const onSignedInWithPrivy = async () => {
    // Adding a poorman semaphore here because privy calls every
    // time the hook is re-rendered
    if (executingOnSignedInWithPrivy) {
      return
    }
    executingOnSignedInWithPrivy = true
    try {
      const accessToken = await privyGetAccessToken()
      const identityToken = cookies['privy-id-token']
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
        onSignedIn(walletAddress)
      }
    } catch (error) {
      console.error(error)
      return null
    }
    executingOnSignedInWithPrivy = false
  }

  // When a user is logged in, this method is called to set the account and refetch the session
  const onSignedIn = async (walletAddress: string) => {
    setStorage('account', walletAddress)
    setAccount(walletAddress)
    await Promise.all([queryClient.refetchQueries(), refetchSession()])
  }

  // Method that tries to sign in with an existing session
  const signInWithExistingSession = async () => {
    const existingAccessToken = getAccessToken()
    // Use the existing access token to log in
    if (existingAccessToken) {
      try {
        const response = await locksmith.user()
        const { walletAddress } = response.data
        if (walletAddress) {
          await onSignedIn(walletAddress)
          window.dispatchEvent(
            new CustomEvent('locksmith.authenticated', {
              detail: walletAddress,
            })
          )
          return true
        }
      } catch (error) {
        console.error('Error using existing access token:', error)
      }
    }
    return false
  }

  const { login: privyLogin } = useLogin({
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

  // Signs the user out (removes the session)
  const signOut = async () => {
    try {
      await privyLogout()
      const session = getAccessToken()
      if (session) {
        // First, revoke the session on the server with the token
        locksmith.revoke().catch(console.error)
        // Then remove token locally
        removeAccessToken()
      }
      setAccount(undefined)
      await Promise.all([queryClient.invalidateQueries(), refetchSession()])
    } catch (error) {
      console.error(error)
    }
  }

  const signInWithSIWE = async () => {
    try {
      const { data: nonce } = await locksmith.nonce()
      const siweResult = await siweSign(nonce, '')

      if (siweResult) {
        const { message, signature } = siweResult
        const response = await locksmith.login({
          message,
          signature,
        })
        const { accessToken, walletAddress } = response.data
        if (accessToken && walletAddress) {
          saveAccessToken({
            accessToken,
            walletAddress,
          })
          await onSignedIn(walletAddress)
        } else {
          console.error('Error logging in with SIWE:', response)
          ToastHelper.error(
            'We could not authenticate you. Please refresh and try again.'
          )
        }
      }
    } catch (error) {
      console.error(error)
      ToastHelper.error(
        'There was an authentication error. Please refresh and try again.'
      )
    }
  }

  // Tries to login the user with Privy
  // Returns true if the modal needs to be shown.
  const signInWithPrivy = async ({ onshowUI }: { onshowUI: () => void }) => {
    if (!(await signInWithExistingSession())) {
      setAccount(undefined)
      if (privyAuthenticated) {
        onSignedInWithPrivy()
      } else {
        privyLogin()
        onshowUI()
      }
    }
  }

  // TODO: do not set this has part of a hook that re-renders many times
  const wallet = wallets[0]
  useEffect(() => {
    const setProviderFromPrivy = async () => {
      if (wallet) {
        setProvider(await wallet.getEthereumProvider())
      }
    }
    if (account && privyAuthenticated) {
      setProviderFromPrivy()
    }
  }, [wallet?.address, account])

  return {
    account,
    email: user?.email?.address,
    signInWithSIWE,
    signInWithPrivy,
    signOut,
    privyReady,
  }
}
