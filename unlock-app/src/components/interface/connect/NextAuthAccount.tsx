import { signOut, useSession } from 'next-auth/react'
import React, { useEffect } from 'react'
import { config } from '~/config/app'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'
import { popupCenter } from '~/utils/popup'

type NextAuthAccountProps = {}

export const NextAuthAccount = ({}: NextAuthAccountProps) => {
  const { data: session } = useSession()

  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn } = useSIWE()

  useEffect(() => {
    // @ts-ignore - Property 'selectedProvider' does not exist on type 'Session'
    if (!session || !session?.selectedProvider) return

    const connectWaasProvider = async () => {
      const waasProvider = new WaasProvider({
        ...config.networks[1],
        email: session.user?.email as string,
        // @ts-ignore - Property 'selectedProvider' does not exist on type 'Session'
        selectedLoginProvider: session.selectedProvider,
      })
      await waasProvider.connect()
      await authenticateWithProvider('WAAS', waasProvider)
      // @ts-ignore - Property 'selectedProvider' does not exist on type 'Session'
      session.selectedProvider = null

      await siweSignIn()
    }

    connectWaasProvider()
    // @ts-ignore - Property 'selectedProvider' does not exist on type 'Session'
  }, [session?.selectedProvider])

  return (
    <div className="flex flex-col">
      <button onClick={() => popupCenter('/google', 'Sample Sign In')}>
        Sign In with Google
      </button>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
