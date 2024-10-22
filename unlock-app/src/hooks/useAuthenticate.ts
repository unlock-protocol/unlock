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

// This hook includes *all* signIn and signOut methods
// TODO: consider adding useSession() stuff here too?
export function useAuthenticate() {
  const { account, setAccount } = useContext<{
    account: string | undefined
    setAccount: (account: string) => void
  }>(AuthenticationContext)
  const { setProvider } = useProvider()
  const [cookies] = useCookies()
  const { refetchSession } = useSession()
  const { setStorage } = useAppStorage()
  const {
    logout: privyLogout,
    getAccessToken: privyGetAccessToken,
    ready,
  } = usePrivy()
  const queryClient = useQueryClient()
  const { siweSign } = useSIWE()
  const { wallets } = useWallets()

  const { login: privyLogin } = useLogin({
    onComplete: async () => {
      try {
        const accessToken = await privyGetAccessToken()
        const identityToken = cookies['privy-id-token']
        const response = await locksmith.loginWithPrivy({
          accessToken: accessToken!,
          identityToken: identityToken!,
        })

        const { accessToken: locksmithAccessToken, walletAddress } =
          response.data
        if (locksmithAccessToken && walletAddress) {
          saveAccessToken({
            accessToken: locksmithAccessToken,
            walletAddress,
          })
          setStorage('account', walletAddress)
          await queryClient.refetchQueries()
          await refetchSession()
          setAccount(walletAddress)
        }
      } catch (error) {
        console.error(error)
        return null
      }
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

  const signOutToken = async () => {
    const session = getAccessToken()
    if (session) {
      // First, revoke the session on the server with the token
      await locksmith.revoke().catch(console.error)
      // Then remove token locally
      return removeAccessToken()
    }
  }

  // Signs the user out (removes the session)
  const signOut = async () => {
    try {
      await privyLogout()
      await signOutToken()
      await Promise.all([queryClient.invalidateQueries(), refetchSession()])
    } catch (error) {
      console.error(error)
    }
  }

  const signInWithSIWE = async (provider: any) => {
    try {
      setProvider(provider)
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
          await queryClient.refetchQueries()
          await refetchSession()
          setAccount(walletAddress)
        }
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const signInWithPrivy = async () => {
    const existingAccessToken = getAccessToken()
    if (existingAccessToken) {
      try {
        // Use the existing access token to log in
        const response = await locksmith.user()
        const { walletAddress } = response.data
        if (walletAddress) {
          setStorage('account', walletAddress)
          await queryClient.refetchQueries()
          await refetchSession()
          setAccount(walletAddress)
          return
        }
      } catch (error) {
        console.error('Error using existing access token:', error)
      }
    } else {
      privyLogin()
    }
  }

  useEffect(() => {
    const setProviderFromPrivy = async () => {
      if (wallets[0]) {
        setProvider(await wallets[0].getEthereumProvider())
      }
    }
    setProviderFromPrivy()
  }, [wallets])

  return {
    account,
    signInWithSIWE,
    signInWithPrivy,
    signOut,
    ready,
  }
}
