import { Placeholder } from '@unlock-protocol/ui'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useConnectModal } from '~/hooks/useConnectModal'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'
import { ToastHelper } from '~/components/helpers/toast.helper'
import SvgComponents from '../svg'
import { useCaptcha } from '~/hooks/useCaptcha'
import ReCaptcha from 'react-google-recaptcha'
import { signOut as nextSignOut } from 'next-auth/react'
import { UserAccountType } from '~/utils/userAccountType'

export type ConnectingWaasProps = {
  openConnectModalWindow?: boolean
}

export const ConnectingWaas = ({
  openConnectModalWindow = false,
}: ConnectingWaasProps) => {
  const { data: session } = useSession()

  const [selectedProvider, _] = useState<UserAccountType>(
    localStorage.getItem('nextAuthProvider') as UserAccountType
  )

  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn, isSignedIn, signOut: siweSignOut } = useSIWE()

  const { account, connected, deAuthenticate } = useAuth()
  const { openConnectModal } = useConnectModal()

  const { recaptchaRef, getCaptchaValue } = useCaptcha()

  const onSignOut = async () => {
    // This sign out is needed with redirect enabled to ensure that there will be no session left
    await nextSignOut()
    await deAuthenticate()
    await siweSignOut()
  }

  useEffect(() => {
    if (!session || !selectedProvider) return

    if (openConnectModalWindow) {
      openConnectModal()
    }

    const connectWaasProvider = async () => {
      const captcha = await getCaptchaValue()

      try {
        const waasProvider = new WaasProvider({
          ...config.networks[1],
          email: session.user?.email as string,
          selectedLoginProvider: selectedProvider,
          token: session.user.token as string,
        })
        await waasProvider.connect(captcha)
        await authenticateWithProvider('WAAS', waasProvider)
        session.user.selectedProvider = null
      } catch (err) {
        console.error(err)
        ToastHelper.error('Error retrieving your wallet, please try again.')
        await onSignOut()
      }
    }

    connectWaasProvider()
  }, [selectedProvider])

  useEffect(() => {
    if (!connected && !isSignedIn) return

    const connect = async () => {
      try {
        await siweSignIn()
      } catch (err) {
        console.error(err)
        ToastHelper.error('Error signing with provider, please try again.')
        await onSignOut()
      }
    }

    connect()
  }, [connected, isSignedIn, account])

  return (
    <div className="h-full px-6 pb-6">
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <div className="grid">
        <div className="flex flex-col items-center justify-center gap-6 pb-6">
          {selectedProvider == UserAccountType.GoogleAccount && (
            <SvgComponents.Google width={40} height={40} />
          )}
          {selectedProvider == UserAccountType.EmailCodeAccount && (
            <SvgComponents.Email width={40} height={40} />
          )}
          <div className="inline-flex items-center gap-2 text-lg font-bold">
            {session && session.user?.email}
          </div>
        </div>
        <span className="flex w-full max-w-lg text-base text-gray-700 justify-center">
          Signing in...
        </span>
        <div>
          <Placeholder.Root className="mt-4">
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Root>
        </div>
        <div className="w-full flex items-center justify-end px-6 py-4">
          <button
            onClick={() => {
              onSignOut()
            }}
            className="hover:text-ui-main-600 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectingWaas
