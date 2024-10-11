import { LoginModal, usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useSIWE } from '~/hooks/useSIWE'

export const ConnectWallet = () => {
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { login, authenticated } = usePrivy()
  const { signIn } = useSIWE()

  useEffect(() => {
    login()
  }, [])

  useEffect(() => {
    if (authenticated) {
      signIn()
    }
  }, [authenticated, signIn])

  return <LoginModal open={true} />
}
