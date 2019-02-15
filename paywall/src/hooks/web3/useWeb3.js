import { useContext } from 'react'
import { ReadOnlyContext } from '../components/Web3'

export default function useWeb3() {
  return useContext(ReadOnlyContext)
}
