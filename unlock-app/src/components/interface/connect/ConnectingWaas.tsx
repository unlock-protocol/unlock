import { Placeholder } from '@unlock-protocol/ui'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useConnectModal } from '~/hooks/useConnectModal'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'
import { signOut as nextSignOut } from 'next-auth/react'
import { ToastHelper } from '~/components/helpers/toast.helper'

export type ConnectingWaasProps = {
  openConnectModalWindow?: boolean
}

export const ConnectingWaas = ({
  openConnectModalWindow = false,
}: ConnectingWaasProps) => {
  const { data: session } = useSession()
  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn, isSignedIn, signOut: siweSignOut } = useSIWE()

  const { connected, deAuthenticate } = useAuth()
  const { openConnectModal } = useConnectModal()

  const onSignOut = async () => {
    await siweSignOut()
    await deAuthenticate()
    await nextSignOut({ redirect: false })
  }

  const [error, setError] = useState<boolean>(false)

  // If loading takes too long, show sign out button
  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setError(true)
    }, 10000)

    return () => {
      clearTimeout(errorTimeout)
    }
  }, [])

  useEffect(() => {
    if (!session || !session?.user?.selectedProvider) return

    if (openConnectModalWindow) {
      openConnectModal()
    }

    const connectWaasProvider = async () => {
      try {
        const waasProvider = new WaasProvider({
          ...config.networks[1],
          email: session.user?.email as string,
          selectedLoginProvider: session.user.selectedProvider as string,
          token: session.user.token as string,
        })
        await waasProvider.connect()
        await authenticateWithProvider('WAAS', waasProvider)
        session.user.selectedProvider = null
      } catch (err) {
        await onSignOut()
      }
    }

    connectWaasProvider()
  }, [session?.user.selectedProvider])

  useEffect(() => {
    if (!connected && !isSignedIn) return

    const connect = async () => {
      try {
        await siweSignIn()
      } catch (err) {
        console.error(err)
        ToastHelper.error('Error signing with provider')
        await onSignOut()
      }
    }

    connect()
  }, [connected, isSignedIn])

  return (
    <div className="h-full px-6 py-2">
      <span className="w-full max-w-lg text-base text-gray-700">
        We are connecting to the Unlock Protocol, please be patient and do not
        refresh the page.
      </span>
      <div>
        <Placeholder.Root className="mt-4">
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Root>
      </div>
      {error && (
        <div className="w-full flex items-center justify-end px-6 py-4">
          <button
            onClick={onSignOut}
            className="hover:text-ui-main-600 underline"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default ConnectingWaas
