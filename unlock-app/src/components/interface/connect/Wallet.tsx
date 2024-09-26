import { LoginModal, usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'

export const ConnectWallet = () => {
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { connectOrCreateWallet } = usePrivy()
  const { wallets } = useWallets()
  const { authenticate } = useAuth()

  console.log(wallets)

  useEffect(() => {
    console.log('render connectOrCreateWallet')
    connectOrCreateWallet()
  }, [])

  useEffect(() => {
    console.log('render connectOrCreateWallet')
    const connectWalletProvider = async () => {
      const provider = await wallets[0].getEthereumProvider()
      console.log(await wallets[0].sign('Please sign!'))
      authenticate(provider)
    }
    connectWalletProvider()
  }, [])

  return <LoginModal open={true} />
}
