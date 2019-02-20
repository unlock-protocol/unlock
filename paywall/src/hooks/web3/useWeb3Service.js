import { useContext } from 'react'
import { Web3ServiceContext } from '../components/Web3ServiceProvider'

export default function useWeb3Service() {
  return useContext(Web3ServiceContext)
}
