import { signIn, signOut, useSession } from 'next-auth/react'
import React, { use, useEffect } from 'react'
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
    if (!session || !session?.waasToken) return

    const connectWaasProvider = async () => {
      const waasProvider = new WaasProvider(config.networks[1])
      await waasProvider.connect()
      await authenticateWithProvider('WAAS', waasProvider)
      session.waasToken = null

      await siweSignIn()
    }

    connectWaasProvider()
  }, [session?.waasToken])

  return (
    <div className="flex flex-col">
      <button onClick={() => popupCenter('/google', 'Sample Sign In')}>
        Sign In with Google
      </button>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
