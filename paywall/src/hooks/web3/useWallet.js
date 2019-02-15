import { useContext } from 'react'
import { WalletContext } from '../components/Wallet'

export default function useWallet() {
  return useContext(WalletContext)
}
