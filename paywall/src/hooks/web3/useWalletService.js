import { useContext } from 'react'
import {
  WalletServiceContext,
  WalletStateContext,
} from '../components/WalletServiceProvider'

export default function useWalletService() {
  const wallet = useContext(WalletServiceContext)
  const state = useContext(WalletStateContext)
  return { wallet, state }
}
