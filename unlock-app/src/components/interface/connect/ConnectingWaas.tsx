import { Placeholder } from '@unlock-protocol/ui'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useConnectModal } from '~/hooks/useConnectModal'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'

export type ConnectingWaasProps = {
  openConnectModalWindow?: boolean
}

export const ConnectingWaas = ({
  openConnectModalWindow = false,
}: ConnectingWaasProps) => {
  const { data: session } = useSession()
  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn, isSignedIn } = useSIWE()

  const { connected } = useAuth()
  const { openConnectModal } = useConnectModal()

  const router = useRouter()
  const restoredState = JSON.parse(
    decodeURIComponent((router.query.state as string) || '{}')
  )

  const redirect = () => {
    if (restoredState.redirectUrl) {
      router.push(restoredState.redirectUrl)
    }
  }

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
        console.error(err)
      }
    }

    connectWaasProvider()
  }, [session?.user.selectedProvider])

  useEffect(() => {
    if (!connected && !isSignedIn) return

    const connect = async () => {
      try {
        await siweSignIn()

        redirect()
      } catch (err) {
        console.error(err)
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
    </div>
  )
}

export default ConnectingWaas
