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
import { useState, useEffect, useRef } from 'react'

export interface SignInWithGoogleProps {
  onNext: (privateKey: string) => void
}

export const SignInWithGoogle = ({ onNext }: SignInWithGoogleProps) => {
  const { getCaptchaValue, recaptchaRef } = useCaptcha()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const cleanupRef = useRef<() => void>(() => {})

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupRef.current()
    }
  }, [])

  const handleSignWithGoogle = async () => {
    if (isAuthenticating) return
    setIsAuthenticating(true)

    let sessionCheckInterval: NodeJS.Timeout | null = null
    let popupWindow: Window | null = null

    // Cleanup function
    const cleanup = () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
        sessionCheckInterval = null
      }
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close()
        popupWindow = null
      }
      window.removeEventListener('message', messageHandler)
    }

    cleanupRef.current = cleanup

    // Handle message from the popup
    const messageHandler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.log('Ignoring message from different origin:', event.origin)
        return
      }

      if (event.data === 'nextAuthGoogleSignInComplete') {
        console.log('Received completion message')
        if (sessionCheckInterval) return // Already polling

        sessionCheckInterval = setInterval(async () => {
          console.debug('Polling for user session...')
          const session = await getSession()
          if (session?.user) {
            console.debug('User session found')
            cleanup()
            try {
              const captcha = await getCaptchaValue()
              if (!captcha) {
                throw new Error('CAPTCHA verification failed')
              }
              const privateKey = await getPrivateKeyFromWaas(
                captcha,
                UserAccountType.GoogleAccount
              )
              if (privateKey) {
                onNext(privateKey)
              } else {
                ToastHelper.error('Error getting private key from WAAS')
              }
            } catch (error) {
              console.error('Error during Google sign in:', error)
              ToastHelper.error('Error during Google sign in')
            } finally {
              setIsAuthenticating(false)
            }
          }
        }, 500) // Check every 500ms
      }
    }

    window.addEventListener('message', messageHandler)

    try {
      console.log('Starting Google sign in process')
      popupWindow = popupCenter('/google-sign-in', 'Google Sign In')
      if (!popupWindow) {
        throw new Error('Failed to open popup')
      }

      // Monitor popup closure
      const popupCheckInterval = setInterval(() => {
        if (popupWindow && popupWindow.closed) {
          console.log('Popup closed, starting cleanup delay')
          clearInterval(popupCheckInterval)
          setTimeout(() => {
            if (isAuthenticating) {
              cleanup()
              ToastHelper.error('Authentication was cancelled')
              setIsAuthenticating(false)
            }
          }, 1000)
        }
      }, 1000)

      // Timeout after 2 minutes
      const timeout = setTimeout(() => {
        if (isAuthenticating) {
          cleanup()
          ToastHelper.error('Authentication timeout')
          setIsAuthenticating(false)
        }
      }, 120000)

      // Update cleanup to include timeout
      cleanupRef.current = () => {
        clearInterval(popupCheckInterval)
        clearTimeout(timeout)
        cleanup()
      }
    } catch (error) {
      console.error('Error initiating Google sign in:', error)
      ToastHelper.error('Google sign in was cancelled')
      setIsAuthenticating(false)
      cleanup()
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
        disabled={isAuthenticating}
      >
        {isAuthenticating ? 'Authenticating...' : 'Sign in with Google'}
      </ConnectButton>
    </div>
  )
}
