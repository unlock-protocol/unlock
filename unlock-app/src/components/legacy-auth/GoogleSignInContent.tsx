'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const GoogleSignInContent = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    const handleSignIn = async () => {
      if (status === 'loading') return

      if (!session) {
        // Sign in without redirect
        const result = await signIn('google', { redirect: false })

        if (result?.error) {
          window.close()
        }
      } else if (session?.user?.token) {
        // Notify opener and close popup
        window.opener?.postMessage(
          'nextAuthGoogleSignInComplete',
          window.location.origin
        )
        window.close()
      }
    }

    void handleSignIn()
  }, [session, status])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Authenticating with Google...</p>
    </div>
  )
}

export default GoogleSignInContent
