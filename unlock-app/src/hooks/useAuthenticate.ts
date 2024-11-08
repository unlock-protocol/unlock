import { usePrivy, useWallets } from '@privy-io/react-auth'
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
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useProvider } from './useProvider'
import AuthenticationContext from '~/contexts/AuthenticationContext'
import { onSignedInWithPrivy } from '~/config/PrivyProvider'

// This hook includes *all* signIn and signOut methods
// TODO: consider adding useSession() stuff here too?
export function useAuthenticate() {
  const { account, setAccount } = useContext<{
    account: string | undefined
    setAccount: (account: string | undefined) => void
  }>(AuthenticationContext)
  const { setProvider } = useProvider()
  const { refetchSession } = useSession()
  const { setStorage } = useAppStorage()
  const {
    logout: privyLogout,
    ready: privyReady,
    authenticated: privyAuthenticated,
    user,
    login: privyLogin,
  } = usePrivy()
  const queryClient = useQueryClient()
  const { siweSign } = useSIWE()
  const { wallets } = useWallets()

  // When a user is logged in, this method is called to set the account and refetch the session
  const onSignedIn = async (walletAddress: string) => {
    const changed = setStorage('account', walletAddress)
    if (changed) {
      await Promise.all([queryClient.refetchQueries(), refetchSession()])
    }
  }

  // Detects when login was successful via an event
  useEffect(() => {
    if (account) {
      onSignedIn(account)
    }
  }, [account])

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
          return true
        }
      } catch (error) {
        console.error('Error using existing access token:', error)
      }
    }
    return false
  }

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
