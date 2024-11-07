'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const GoogleSignInContent = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (!(status === 'loading') && !session) {
      void signIn('google', {
        redirect: true,
      })
    }
    if (session?.user?.token) {
      window.opener?.postMessage(
        'nextAuthGoogleSignInComplete',
        window.location.origin
      )
      window.close()
    }
  }, [session, status])

  return (
    <div
      style={{
        width: '50vw',
        height: '50vh',
        position: 'absolute',
        left: 0,
        top: 0,
        background: 'white',
      }}
    ></div>
  )
}

export default GoogleSignInContent
