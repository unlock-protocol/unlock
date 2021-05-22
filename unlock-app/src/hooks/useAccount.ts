import { useContext } from 'react'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { ConfigContext } from '../utils/withConfig'
import { StorageService } from '../services/storageService'
import { WalletServiceContext } from '../utils/withWalletService'
import { generateTypedData } from './useCards'

export const getAccountTokenBalance = async (
  web3Service: any,
  accountAddress: string,
  contractAddress: string,
  network: number
) => {
  if (contractAddress) {
    return web3Service.getTokenBalance(contractAddress, accountAddress, network)
  }

  return web3Service.getAddressBalance(accountAddress, network)
}

/**
 * A hook which yield a lock, tracks its state changes, and (TODO) provides methods to update it
 */
export const useAccount = (address: string, network: number) => {
  const web3Service = useContext(Web3ServiceContext)
  const config = useContext(ConfigContext)
  const walletService = useContext(WalletServiceContext)

  const getTokenBalance = (tokenAddress: string) => {
    return getAccountTokenBalance(web3Service, address, tokenAddress, network)
  }

  const connectStripeToLock = async (
    lockAddress: string,
    network: number,
    baseUrl: string
  ) => {
    const storageService = new StorageService(config.services.storage.host)
    const typedData = generateTypedData({
      'Connect Stripe': {
        lockAddress,
        chain: network,
        lockManager: address,
        baseUrl,
      },
    })

    const signature = await walletService.unformattedSignTypedData(
      address,
      typedData
    )

    try {
      return (
        await storageService.getStripeConnect(lockAddress, signature, typedData)
      ).url
    } catch (error) {
      return null
    }
  }

  return { getTokenBalance, connectStripeToLock }
}
export default useAccount
