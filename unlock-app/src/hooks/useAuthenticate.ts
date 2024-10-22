import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useAppStorage } from './useAppStorage'
import { useEffect } from 'react'
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

// This hook includes *all* signIn and signOut methods
// TODO: consider adding useSession() and useAuth() stuff here too?

export function useAuthenticate() {
  const { setProvider } = useProvider()
  const [cookies] = useCookies()
  const { refetchSession } = useSession()
  const { setStorage } = useAppStorage()
  const { logout: privyLogout, getAccessToken: privyGetAccessToken } =
    usePrivy()
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
        }
        setStorage('account', walletAddress)

        await queryClient.refetchQueries()
        await refetchSession()
      } catch (error) {
        console.error(error)
        return null
      }
    },
    onError: (error) => {
      ToastHelper.error(`Error while logging in: ${error}`)
      console.error(error)
    },
  })
  const queryClient = useQueryClient()
  const { siweSign } = useSIWE()
  const { wallets } = useWallets()

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
      // TODO: connect Provider first!
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
        }
        await queryClient.refetchQueries()
        await refetchSession()
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const signInWithPrivy = async () => {
    privyLogin()
  }

  useEffect(() => {
    const userProviderFromPrivy = async () => {
      if (wallets[0]) {
        setProvider(await wallets[0].getEthereumProvider())
      }
    }
    userProviderFromPrivy()
  }, [wallets])

  return {
    signInWithSIWE,
    signInWithPrivy,
    signOut,
  }
}
