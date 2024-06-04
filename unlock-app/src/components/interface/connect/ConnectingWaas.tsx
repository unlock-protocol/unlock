import { Placeholder } from '@unlock-protocol/ui'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'

export const ConnectingWaas = () => {
  const { data: session } = useSession()
  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn, isSignedIn } = useSIWE()

  const { connected } = useAuth()

  const router = useRouter()
  const restoredState = JSON.parse(
    decodeURIComponent((router.query.state as string) || '{}')
  )

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const redirect = () => {
    if (restoredState.redirectUrl) {
      router.push(restoredState.redirectUrl)
    }
  }

  useEffect(() => {
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        router.push('/')
        timeoutRef.current = null
      }, 10000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // @ts-expect-error - selectedProvider is not in the type definition
    if (!session || !session?.selectedProvider) return

    const connectWaasProvider = async () => {
      try {
        const waasProvider = new WaasProvider({
          ...config.networks[1],
          email: session.user?.email as string,
          // @ts-expect-error - selectedProvider is not in the type definition
          selectedLoginProvider: session.selectedProvider,
        })
        await waasProvider.connect()
        await authenticateWithProvider('WAAS', waasProvider)
        // @ts-expect-error - selectedProvider is not in the type definition
        session.selectedProvider = null
      } catch (err) {
        console.error(err)
      }
    }

    connectWaasProvider()
    // @ts-expect-error - selectedProvider is not in the type definition
  }, [session?.selectedProvider])

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
      <Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Root>
    </div>
  )
}

export default ConnectingWaas
