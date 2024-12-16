'use client'

import { useLogin } from '@privy-io/react-auth'
import { useEffect, useRef } from 'react'
import { LoginModal } from '@privy-io/react-auth'

interface ConnectToPrivyProps {
  userEmail: string
  onNext: () => void
  setPrivyConnected: (connected: boolean) => void
}

export default function ConnectToPrivy({
  userEmail,
  onNext,
  setPrivyConnected,
}: ConnectToPrivyProps) {
  const { login } = useLogin({
    onComplete: async () => {
      // Set Privy connection status to true
      setPrivyConnected(true)
      // Then proceed to next step
      onNext()
    },
    onError: (error) => {
      console.error('Privy login error:', error)
    },
  })

  // Ref to track if login has been triggered to prevent multiple renders
  const hasLoggedIn = useRef(false)

  // Trigger login when component mounts
  useEffect(() => {
    if (userEmail && !hasLoggedIn.current) {
      login({ prefill: { type: 'email', value: userEmail } })
      hasLoggedIn.current = true
    }
  }, [userEmail, login])

  if (!userEmail) {
    return null
  }

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
