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
  console.log('restoredState', restoredState)

  useEffect(() => {
    if (!session || !session?.waasToken) return

    console.log('Connecting to WAAS')

    const connectWaasProvider = async () => {
      console.log('Connecting to WAAS')
      const waasProvider = new WaasProvider(config.networks[1])
      await waasProvider.connect()
      await authenticateWithProvider('WAAS', waasProvider)
      session.waasToken = null
    }

    connectWaasProvider()
  }, [session?.waasToken])

  useEffect(() => {
    if (!connected && !isSignedIn) return

    const connect = async () => {
      console.log('Connecting to SIWE in useEffect')
      await siweSignIn()

      console.log(restoredState.redirectUrl)
      router.push(restoredState.redirectUrl)
    }

    connect()
  }, [connected, isSignedIn])

  return <div>ConnectingContent</div>
}

export default ConnectingContent
