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
      console.log('Starting Google sign in process')
      const popup = popupCenter('/google-sign-in', 'Google Sign In')
      if (!popup) {
        throw new Error('Failed to open popup')
      }

      await new Promise<void>((resolve, reject) => {
        let sessionCheckInterval: NodeJS.Timeout
        let isResolved = false

        const messageHandler = async (event: MessageEvent) => {
          console.log('Received message:', event.data)
          if (event.origin !== window.location.origin) {
            console.log('Ignoring message from different origin:', event.origin)
            return
          }

          if (event.data === 'nextAuthGoogleSignInComplete') {
            console.log('Received completion message')
            // Start checking for session after receiving completion message
            console.debug('Starting to poll for user session')
            sessionCheckInterval = setInterval(async () => {
              console.debug('Polling for user session...')
              const session = await getSession()
              if (session?.user && !isResolved) {
                console.debug('User session found')
                isResolved = true
                clearInterval(sessionCheckInterval)
                window.removeEventListener('message', messageHandler)
                resolve()
              }
            }, 500) // Check every 500ms
          }
        }

        window.addEventListener('message', messageHandler)

        const cleanup = setInterval(() => {
          if (popup.closed) {
            console.log('Popup closed, starting cleanup delay')
            clearInterval(cleanup)

            setTimeout(() => {
              if (!isResolved) {
                console.log(
                  'No successful resolution after popup closed, rejecting'
                )
                clearInterval(sessionCheckInterval)
                window.removeEventListener('message', messageHandler)
                reject(new Error('Authentication failed or was cancelled'))
              }
            }, 1000)
          }
        }, 1000)

        // Timeout after 2 minutes
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true
            clearInterval(cleanup)
            clearInterval(sessionCheckInterval)
            window.removeEventListener('message', messageHandler)
            reject(new Error('Authentication timeout'))
          }
        }, 120000)
      })

      console.log('Promise resolved successfully')
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
