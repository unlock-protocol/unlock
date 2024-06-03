import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'
import { ToastHelper } from '../helpers/toast.helper'

export const ConnectingContent = () => {
  const { data: session } = useSession()
  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn, isSignedIn } = useSIWE()

  const { connected } = useAuth()

  const router = useRouter()
  const restoredState = JSON.parse(
    decodeURIComponent((router.query.state as string) || '{}')
  )

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        redirect()
        timeoutRef.current = null
      }, 10000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const redirect = () => {
    if (restoredState.redirectUrl) {
      router.push(restoredState.redirectUrl)
    } else {
      router.push('/')
    }
  }

  useEffect(() => {
    if (!session || !session?.selectedProvider) return

    const connectWaasProvider = async () => {
      try {
        const waasProvider = new WaasProvider({
          ...config.networks[1],
          email: session.user?.email as string,
          selectedLoginProvider: session.selectedProvider,
        })
        await waasProvider.connect()
        await authenticateWithProvider('WAAS', waasProvider)
        session.selectedProvider = null
      } catch (err) {
        ToastHelper.error(`Error: ${err}`)
        redirect()
      }
    }

    connectWaasProvider()
  }, [session?.selectedProvider])

  useEffect(() => {
    if (!connected && !isSignedIn) return

    const connect = async () => {
      try {
        await siweSignIn()

        redirect()
      } catch (err) {
        ToastHelper.error(`Error: ${err}`)
        redirect()
      }
    }

    connect()
  }, [connected, isSignedIn])

  return <div>ConnectingContent</div>
}

export default ConnectingContent
