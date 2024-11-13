'use client'

import { saveAccessToken } from '~/utils/session'
import {
  getAccessToken as privyGetAccessToken,
  PrivyProvider,
  useLogin,
  useCreateWallet,
  User,
} from '@privy-io/react-auth'
import { ReactNode, useContext, useEffect, useState, useCallback } from 'react'
import { config } from './app'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from './locksmith'
import AuthenticationContext from '~/contexts/AuthenticationContext'
import { MigrationModal } from '~/components/legacy-auth/MigrationNotificationModal'

// check for legacy account
export const checkLegacyAccount = async (
  emailAddress: string
): Promise<boolean> => {
  try {
    const response = await locksmith.getUserAccountType(emailAddress)
    return (
      response.data.userAccountType?.some((type: string) => {
        return (
          type === 'EMAIL_CODE' ||
          type === 'UNLOCK_ACCOUNT' ||
          type === 'GOOGLE_ACCOUNT' ||
          type === 'PASSKEY_ACCOUNT'
        )
      }) || false
    )
  } catch (error) {
    console.error('Error checking legacy account:', error)
    return false
  }
}

// This method is meant to be called when the user is signed in with Privy,
// BUT NOT yet signed in with Locksmith and hence does not have an access token.
export const onSignedInWithPrivy = async (user: User) => {
  try {
    const accessToken = await privyGetAccessToken()
    if (!accessToken) {
      console.error('No access token found in Privy')
      return null
    }
    const walletAddress = user.wallet?.address
    if (walletAddress) {
      const response = await locksmith.loginWithPrivy({
        accessToken,
        walletAddress,
      })
      const { accessToken: locksmithAccessToken } = response.data
      if (locksmithAccessToken && walletAddress) {
        saveAccessToken({
          accessToken: locksmithAccessToken,
          walletAddress,
        })
        window.dispatchEvent(
          new CustomEvent('locksmith.authenticated', { detail: walletAddress })
        )
        return walletAddress
      }
    } else {
      console.error(
        'No wallet linked on Privy account, cannot authenticate with Locksmith'
      )
      return null
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
  const { createWallet } = useCreateWallet({
    onError: (error) => {
      console.error('Error creating wallet:', error)
      ToastHelper.error('Failed to create wallet. Please try again.')
    },
  })
  const [showMigrationModal, setShowMigrationModal] = useState(false)

  // handle wallet creation
  const createWalletForUser = useCallback(async () => {
    try {
      const newWallet = await createWallet()
      return newWallet.address
    } catch (error) {
      console.error('Error creating wallet:', error)
      ToastHelper.error('Failed to create wallet. Please try again.')
      return null
    }
  }, [createWallet])

  // handle onComplete logic
  const handleLoginComplete = useCallback(
    async (user: User) => {
      let hasLegacyAccount = false

      // Check for legacy account if user logged in with email
      if (user.email?.address) {
        hasLegacyAccount = await checkLegacyAccount(user.email.address)
        if (hasLegacyAccount) {
          setShowMigrationModal(true)
          // close connect modal
          window.dispatchEvent(new CustomEvent('legacy.account.detected'))
          return
        }
      }

      // Only create wallet if user doesn't have one AND doesn't have a legacy account
      if (!user.wallet?.address && !hasLegacyAccount) {
        const walletAddress = await createWalletForUser()
        if (!walletAddress) return
      }

      // Proceed with normal login flow
      await onSignedInWithPrivy(user)
    },
    [createWalletForUser, setShowMigrationModal]
  )

  useLogin({
    onComplete: handleLoginComplete,
    onError: (error) => {
      if (error !== 'generic_connect_wallet_error') {
        ToastHelper.error(`Error while logging in: ${error}`)
      } else {
        ToastHelper.error('Error while logging in. Please retry!')
      }
      console.error(error)
    },
  })

  // Detects when login was successful via an event
  // This should render only once!
  useEffect(() => {
    const onAuthenticated = async (event: any) => {
      setAccount(event.detail)
    }
    window.addEventListener('locksmith.authenticated', onAuthenticated)
    return () => {
      window.removeEventListener('locksmith.authenticated', onAuthenticated)
    }
  }, [setAccount])

  return (
    <>
      {children}
      <MigrationModal
        isOpen={showMigrationModal}
        setIsOpen={setShowMigrationModal}
      />
    </>
  )
}

export const Privy = ({ children }: { children: ReactNode }) => {
  const isMigratePage =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('migrate-user')

  return (
    <PrivyProvider
      config={{
        loginMethods: isMigratePage
          ? ['email']
          : ['wallet', 'email', 'google', 'farcaster'],
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
      appId={config.privyAppId}
    >
      <PrivyChild>{children}</PrivyChild>
    </PrivyProvider>
  )
}

export default Privy
