import { LoginModal, usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useSIWE } from '~/hooks/useSIWE'

export const ConnectWallet = () => {
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { login, logout, ready, authenticated, user } = usePrivy()
  const { signIn } = useSIWE()
  const { wallets } = useWallets()

  useEffect(() => {
    console.log('ready', ready)
    console.log('render login')
    console.log('authenticated', authenticated)
    console.log('user', user)
    login()
  }, [])

  useEffect(() => {
    if (authenticated) {
      console.log('signing in')
      signIn()
    }
  }, [authenticated, signIn])

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
