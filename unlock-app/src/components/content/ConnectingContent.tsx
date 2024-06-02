import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'

export const ConnectingContent = () => {
  const { data: session } = useSession()
  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn, isSignedIn } = useSIWE()

  const { connected } = useAuth()

  const router = useRouter()
  const restoredState = JSON.parse(
    decodeURIComponent((router.query.state as string) || '{}')
  )

  useEffect(() => {
    if (!session || !session?.selectedProvider) return

    const connectWaasProvider = async () => {
      const waasProvider = new WaasProvider({
        ...config.networks[1],
        email: session.user?.email as string,
        selectedLoginProvider: session.selectedProvider,
      })
      await waasProvider.connect()
      await authenticateWithProvider('WAAS', waasProvider)
      session.selectedProvider = null
    }

    connectWaasProvider()
  }, [session?.selectedProvider])

  useEffect(() => {
    if (!connected && !isSignedIn) return

    const connect = async () => {
      console.log('Connecting to SIWE in useEffect')
      await siweSignIn()

      if (restoredState.redirectUrl) {
        console.log(restoredState.redirectUrl)
        router.push(restoredState.redirectUrl)
      }
    }

    connect()
  }, [connected, isSignedIn])

  return <div>ConnectingContent</div>
}

export default ConnectingContent
