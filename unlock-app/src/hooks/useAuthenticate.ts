import { useLogin, usePrivy } from '@privy-io/react-auth'
import { useAuth } from '../contexts/AuthenticationContext'
import { useAppStorage } from './useAppStorage'
import { useConnectModal } from './useConnectModal'
import { useCallback } from 'react'
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

// This hook includes *all* signIn and signOut methods
// TODO: consider adding useSession() and useAuth() stuff here too?

export function useAuthenticate() {
  const [cookies] = useCookies()
  const { authenticate } = useAuth()
  const { refetchSession } = useSession()
  const { setStorage, removeKey } = useAppStorage()
  const { send } = useConnectModal()
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

  const signOutToken = async () => {
    const session = getAccessToken()
    if (session) {
      // First, revoke the session on the server with the token
      await locksmith.revoke().catch(console.error)
      // Then remove token locally
      return removeAccessToken()
    }
  }

  // currently used to sign out in the dashboard's `UserMenu`
  const signOut = async () => {
    try {
      await privyLogout()
      await signOutToken()
      await Promise.all([queryClient.invalidateQueries(), refetchSession()])
    } catch (error) {
      console.error(error)
    }
  }

  const authenticateWithProvider = useCallback(
    async (providerType: WalletProvider, provider?: any) => {
      try {
        if (!walletHandlers[providerType]) {
          removeKey('provider')
        }
        const connectedProvider = walletHandlers[providerType](provider)

        const p = await connectedProvider
        if (!p?.account) {
          return console.error('Unable to get provider')
        }
        if (p?.provider?.isUnlock && p?.provider?.emailAddress) {
          setStorage('email', p?.provider?.emailAddress)
        } else {
          removeKey('email')
        }
        setStorage('provider', providerType)
        send(connectedProvider)
        return connectedProvider
      } catch (error) {
        console.error('We could not connect to the provider', error)
        return null
      }
    },
    [setStorage, removeKey, send]
  )

  const signInWithSIWE = async () => {
    try {
      // TODO: connect Provider first!
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

  return {
    authenticate,
    signInWithSIWE,
    signInWithPrivy,
    signOut,
    authenticateWithProvider,
  }
}
