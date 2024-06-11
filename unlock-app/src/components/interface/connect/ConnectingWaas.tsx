import { Placeholder } from '@unlock-protocol/ui'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'

export type ConnectingWaasProps = {
  shouldReloadOnTimeout?: boolean
}

export const ConnectingWaas = ({
  shouldReloadOnTimeout = false,
}: ConnectingWaasProps) => {
  const { data: session } = useSession()
  console.log(session)
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
      timeoutRef.current = setTimeout(async () => {
        if (shouldReloadOnTimeout) {
          await signOut()
          timeoutRef.current = null
          window.location.reload()
        } else {
          timeoutRef.current = null
          router.push('/')
        }
      }, 10000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!session || !session?.user?.selectedProvider) return

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
