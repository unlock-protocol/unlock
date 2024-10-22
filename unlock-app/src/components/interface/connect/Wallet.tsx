import { LoginModal } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export const ConnectWallet = () => {
  const { signInWithPrivy } = useAuthenticate()

  useEffect(() => {
    signInWithPrivy()
  }, [])

  return <LoginModal open={true} />
}
