import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import { useCallback, useEffect } from 'react'

interface ConnectedWalletProps {
  onNext?: () => void
}

// I don't think we need this component anymore!
export const ConnectedWallet = ({ onNext }: ConnectedWalletProps) => {
  const { connected } = useAuth()
  const { signIn } = useSIWE()

  const onSignIn = useCallback(async () => {
    await signIn()
  }, [signIn])

  useEffect(() => {
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
