import { useContext } from 'react'
import { Web3ServiceContext } from '../utils/withWeb3Service'

export const getAccountTokenBalance = async (
  web3Service: any,
  accountAddress: string,
  contractAddress: string
) => {
  if (contractAddress) {
    return web3Service.getTokenBalance(contractAddress, accountAddress)
  }

  return web3Service.refreshAccountBalance({
    address: accountAddress,
  })
}

/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 */
export const useAccount = (address: string) => {
  const web3Service = useContext(Web3ServiceContext)

  const getTokenBalance = (tokenAddress: string) => {
    return getAccountTokenBalance(web3Service, address, tokenAddress)
  }

  return { getTokenBalance }
}
export default useAccount
