import SvgComponents from '../interface/svg'

import { popupCenter } from '~/utils/popup'

import { ConnectButton } from '../interface/connect/Custom'
import { signIn } from 'next-auth/react'

export interface SignInWithGoogleProps {
  email: string
  useIcon?: boolean
  setWalletPk: (pk: string) => void
  onNext: () => void
}

export const SignInWithGoogle = ({
  email,
  setWalletPk,
  onNext,
}: SignInWithGoogleProps) => {
  const handleSignWithGoogle = async () => {
    const popup = popupCenter('/google-sign-in', 'Google Sign In')

    const messageHandler = async (event: MessageEvent) => {
      if (event.data === 'nextAuthGoogleSignInComplete') {
        window.removeEventListener('message', messageHandler)
        await signIn('google', {
          redirect: false,
        })
      }
    }

    window.addEventListener('message', messageHandler)

    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup)
        window.removeEventListener('message', messageHandler)
      }
    }, 1000)
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
