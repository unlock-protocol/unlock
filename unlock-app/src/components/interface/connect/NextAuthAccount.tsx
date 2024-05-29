import { signIn, signOut, useSession } from 'next-auth/react'
import React, { use, useEffect } from 'react'
import { config } from '~/config/app'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import WaasProvider from '~/services/WaasProvider'

type NextAuthAccountProps = {}

export const NextAuthAccount = ({}: NextAuthAccountProps) => {
  const { data: session } = useSession()

  const { authenticateWithProvider } = useAuthenticate()
  const { signIn: siweSignIn } = useSIWE()

  let connected = false

  const signInNewWindow = (provider: string) => {
    const signInRoute = `/api/auth/signin/${provider}` // adjust this if your sign-in route is different
    window.open(signInRoute, '_blank', 'height=600,width=500')
  }

  useEffect(() => {
    if (!session || !session?.waasToken) return

    const connectWaasProvider = async () => {
      console.log('Connecting to WAAS')
      const waasProvider = new WaasProvider(config.networks[1])
      await waasProvider.connect()
      await authenticateWithProvider('WAAS', waasProvider)
      session.waasToken = null

      console.log('Signing in')
      await siweSignIn()
    }

    connectWaasProvider()
  }, [session?.waasToken])

  return (
    <div className="">
      <button onClick={() => signInNewWindow('google')}>Sign in</button>
      {session && <p>WAAS UUID: {session.waasToken}</p>}
    </div>
  )

  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn('google')}>Sign in</button>
    </>
  )
}
