'use client'

import { saveAccessToken } from '~/utils/session'
import {
  getAccessToken as privyGetAccessToken,
  PrivyProvider,
  useLogin,
  useCreateWallet,
  User,
  usePrivy,
} from '@privy-io/react-auth'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { config } from './app'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from './locksmith'
import AuthenticationContext from '~/contexts/AuthenticationContext'
import { MigrationModal } from '~/components/legacy-auth/MigrationNotificationModal'
import { isInIframe } from '~/utils/iframe'

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

// IMPORTANT: This component should be rendered only once in the app. Do NOT add hooks here.
export const PrivyChild = ({ children }: { children: ReactNode }) => {
  const { setAccount } = useContext(AuthenticationContext)

  // handle onComplete logic
  const handleLoginComplete = async (user: User) => {
    // Proceed with normal login flow
    await onSignedInWithPrivy(user)
  }

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
      <PrivyMigration />
    </>
  )
}

export const PrivyMigration = () => {
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const { user } = usePrivy()

  const { createWallet } = useCreateWallet({
    onError: (error) => {
      console.error('Error creating wallet:', error)
      ToastHelper.error('Failed to create wallet. Please try again.')
    },
  })

  // handle wallet creation
  const createWalletForUser = async () => {
    try {
      const newWallet = await createWallet()
      return newWallet.address
    } catch (error) {
      console.error('Error creating wallet:', error)
      ToastHelper.error('Failed to create wallet. Please try again.')
      return null
    }
  }

  // handle onComplete logic
  const handleMigrationIfNeeded = async (user: User) => {
    let hasLegacyAccount = false

    // Check for legacy account if user logged in with email
    if (user.email?.address) {
      hasLegacyAccount = await checkLegacyAccount(user.email.address)

      // Only show migration modal if user has legacy account but no Privy wallet
      if (hasLegacyAccount && !user.wallet?.address) {
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
  }

  useEffect(() => {
    if (user) {
      handleMigrationIfNeeded(user)
    }
  }, [user])

  return (
    <MigrationModal
      isOpen={showMigrationModal}
      setIsOpen={setShowMigrationModal}
    />
  )
}

export const Privy = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | undefined>(undefined)
  const isMigratePage =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('migrate-user')

  // Check if we're in an iframe && not in the Unlock dashboard
  const isInPaywall =
    isInIframe() && !window.location.href.includes(config.unlockApp)

  return (
    <AuthenticationContext.Provider value={{ account, setAccount }}>
      <PrivyProvider
        config={{
          /* For the meantime, when users are authenticating via paywall on an external website (embedded paywall),
           * we can only allow the wallet method to login.
           */
          loginMethods: isMigratePage
            ? ['email']
            : isInPaywall
              ? ['wallet']
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
    </AuthenticationContext.Provider>
  )
}

export default Privy
