import SvgComponents from '../interface/svg'

import { popupCenter } from '~/utils/popup'

import { ConnectButton } from '../interface/connect/Custom'
import { signIn } from 'next-auth/react'
import { getPrivateKeyFromWaas } from './SignInWithCode'
import { ToastHelper } from '../helpers/toast.helper'
import { useCaptcha } from '~/hooks/useCaptcha'

export interface SignInWithGoogleProps {
  onNext: (privateKey: string) => void
}

export const SignInWithGoogle = ({ onNext }: SignInWithGoogleProps) => {
  const { getCaptchaValue } = useCaptcha()

  const handleSignWithGoogle = async () => {
    const popup = popupCenter('/google-sign-in', 'Google Sign In')

    const messageHandler = async (event: MessageEvent) => {
      if (event.data === 'nextAuthGoogleSignInComplete') {
        window.removeEventListener('message', messageHandler)

        // Wait for the popup to close
        if (popup) {
          const checkClosed = () => {
            return new Promise<void>((resolve) => {
              const check = setInterval(() => {
                if (popup.closed) {
                  clearInterval(check)
                  resolve()
                }
              }, 100)
            })
          }
          await checkClosed()
        }

        const signInResult = await signIn('google', {
          redirect: false,
        })

        if (signInResult?.ok) {
          // Only get private key if sign in was successful
          try {
            const privateKey = await getPrivateKeyFromWaas(
              await getCaptchaValue()
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
        } else {
          ToastHelper.error('Google sign in failed')
        }
      }
    }

    window.addEventListener('message', messageHandler)

    // Remove the separate interval since we handle it in messageHandler
    if (popup) {
      const cleanup = setInterval(() => {
        if (popup.closed) {
          clearInterval(cleanup)
          window.removeEventListener('message', messageHandler)
        }
      }, 1000)
    }
  }

  return (
    <div className="w-full">
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
