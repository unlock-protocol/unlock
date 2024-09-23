import { LoginModal, usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'

export const ConnectWallet = () => {
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { login, logout, ready, ...rest } = usePrivy()
  const { wallets } = useWallets()
  const { authenticate } = useAuth()

  console.log(rest)
  useEffect(() => {
    const loginWithPrivy = async () => {
      await logout()
      await login()
    }
    loginWithPrivy()
  }, [])

  useEffect(() => {
    // const connectWalletProvider = async () => {
    //   console.log(wallets[0])
    //   const provider = await wallets[0].getEthereumProvider()
    //   authenticate(provider)
    // }
    // connectWalletProvider()
  }, [wallets, authenticate])

  return <LoginModal open={ready} />
}
