import { LoginModal, usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'

export const ConnectWallet = () => {
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { login, logout } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    logout()
    console.log('render login')
    login()
  }, [])

  // useEffect(() => {
  //   console.log('render connectOrCreateWallet')
  //   const connectWalletProvider = async () => {
  //     const provider = await wallets[0].getEthereumProvider()
  //     const signature = await wallets[0].sign('Please sign!')
  //     console.log({ signature })
  //     const message = 'I hereby vote for foobar'
  //     const signature2 = await provider.request({
  //       method: 'personal_sign',
  //       params: [message, wallets[0].address],
  //     })
  //     console.log(signature2)
  //     authenticate(provider)
  //   }
  //   connectWalletProvider()
  // }, [])

  return <LoginModal open={true} />
}
