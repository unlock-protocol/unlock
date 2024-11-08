import SvgComponents from '../interface/svg'

import { popupCenter } from '~/utils/popup'

import { ConnectButton } from '../interface/connect/Custom'
import { getSession } from 'next-auth/react'
import { ToastHelper } from '../helpers/toast.helper'
import { useCaptcha } from '~/hooks/useCaptcha'
import { UserAccountType } from '~/utils/userAccountType'
import { getPrivateKeyFromWaas } from './SignInWithCode'
import ReCAPTCHA from 'react-google-recaptcha'
import { config } from '~/config/app'

export interface SignInWithGoogleProps {
  onNext: (privateKey: string) => void
}

export const SignInWithGoogle = ({ onNext }: SignInWithGoogleProps) => {
  const { getCaptchaValue, recaptchaRef } = useCaptcha()

  const handleSignWithGoogle = async () => {
    try {
      // Open popup for Google sign in
      const popup = popupCenter('/google-sign-in', 'Google Sign In')
      if (!popup) {
        throw new Error('Failed to open popup')
      }

      console.debug('Popup opened')
      // Create promise to handle popup message and session
      await new Promise<void>((resolve, reject) => {
        let sessionCheckInterval: NodeJS.Timeout

        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data === 'nextAuthGoogleSignInComplete') {
            // Start checking for session after receiving completion message
            console.debug('Starting to poll for user session')
            sessionCheckInterval = setInterval(async () => {
              console.debug('Polling for user session...')
              const session = await getSession()
              if (session?.user) {
                console.debug('User session found')
                clearInterval(sessionCheckInterval)
                window.removeEventListener('message', messageHandler)
                resolve()
              }
            }, 500) // Check every 500ms
          }
        }

        window.addEventListener('message', messageHandler)

        // Cleanup if popup is closed manually
        const cleanup = setInterval(() => {
          if (popup.closed) {
            clearInterval(cleanup)
            clearInterval(sessionCheckInterval)
            window.removeEventListener('message', messageHandler)
            reject(new Error('Popup closed by user'))
          }
        }, 1000)

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(cleanup)
          clearInterval(sessionCheckInterval)
          window.removeEventListener('message', messageHandler)
          reject(new Error('Authentication timeout'))
        }, 120000)
      })

      // At this point we have a confirmed session
      try {
        const privateKey = await getPrivateKeyFromWaas(
          await getCaptchaValue(),
          UserAccountType.GoogleAccount
        )
        if (privateKey) {
          onNext(privateKey)
        } else {
          ToastHelper.error('Error getting private key from WAAS')
        }
      } catch (error) {
        console.error(error)
        ToastHelper.error('Error during Google sign in')
      }
    } catch (error) {
      console.error(error)
      ToastHelper.error('Google sign in was cancelled')
    }
  }

  return (
    <div className="w-full">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <ConnectButton
        className="w-full"
        icon={<SvgComponents.Google width={40} height={40} />}
        onClick={handleSignWithGoogle}
      >
        Sign in with Google
      </ConnectButton>
    </div>
  )
}
