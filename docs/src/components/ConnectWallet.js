import { usePrivy } from '@privy-io/react-auth'

export const ConnectWallet = () => {
  const { ready, authenticated, user, login, logout } = usePrivy()
  return <button onClick={login}>Connect Wallet</button>
}
