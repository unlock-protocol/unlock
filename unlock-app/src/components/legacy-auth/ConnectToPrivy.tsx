'use client'

import { LoginModal, usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'

export default function ConnectToPrivy({ userEmail }: { userEmail: string }) {
  const { ready, authenticated, login } = usePrivy()

  useEffect(() => {
    if (!authenticated && ready && userEmail) {
      login({ prefill: { type: 'email', value: userEmail } })
    }
  }, [])

  if (!userEmail) {
    return null
  }

  if (!authenticated) {
    return (
      <div className="space-y-5">
        <div className="text-2xl font-bold">Ready to Connect to Privy</div>
        <p className="text-gray-700">
          Create a Privy account to proceed with the migration.
        </p>
        <div className="h-full space-y-4">
          <LoginModal open={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-gray-700">
        Your account has been successfully connected to Privy. Now, the last
        stage; migration!
      </p>
    </div>
  )
}
