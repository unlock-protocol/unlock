import { useContext } from 'react'
import {
  WalletServiceContext,
  WalletStateContext,
} from '../components/WalletService'

export default function useWalletService() {
  const wallet = useContext(WalletServiceContext)
  const state = useContext(WalletStateContext)
  return { wallet, state }
}
