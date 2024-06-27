import UnlockProvider from '../services/unlockProvider'
import { useConfig } from '../utils/withConfig'
import { captureCharge } from './useCards'
import { locksmith } from '~/config/locksmith'

export const getAccountTokenBalance = async (
  web3Service: any,
  accountAddress: string,
  contractAddress: string | null | undefined,
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
export const useAccount = (address: string) => {
  const config = useConfig()

  const retrieveUserAccount = async (email: string, password: string) => {
    const encryptedKey = await locksmith.getUserPrivateKey(email)
    const unlockProvider = new UnlockProvider(config.networks[1])

    await unlockProvider.connect({
      key: encryptedKey.data.passwordEncryptedPrivateKey as string,
      emailAddress: email,
      password,
    })
    return unlockProvider
  }

  /**
   * Prepares a charge on the backend
   * @param token
   * @param lock
   * @param network
   * @param pricing
   * @param recipient
   * @returns
   */
  const captureChargeForCard = async (
    lock: any,
    network: number,
    recipients: string[],
    paymentIntent: string
  ) => {
    const response = await captureCharge(
      config,
      lock,
      network,
      address,
      recipients,
      paymentIntent
    )
    return response
  }

  return {
    captureChargeForCard,
    retrieveUserAccount,
  }
}
export default useAccount
