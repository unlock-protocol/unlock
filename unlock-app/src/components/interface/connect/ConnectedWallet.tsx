import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import { useCallback, useEffect } from 'react'

interface ConnectedWalletProps {
  onNext?: () => void
}

export const ConnectedWallet = ({ onNext }: ConnectedWalletProps) => {
  const { connected } = useAuth()
  const { session, signIn } = useSIWE()

  const onSignIn = useCallback(async () => {
    await signIn()
  }, [signIn])

  useEffect(() => {
    console.log('connected', connected)
    if (connected) {
      onSignIn()
    }
  }, [connected, onSignIn])

  return (
    <div className="grid">
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col gap-4">
          <h3 className="text-gray-700">
            Setting up your account, please wait...
          </h3>
        </div>
      </div>
    </div>
  )
}
