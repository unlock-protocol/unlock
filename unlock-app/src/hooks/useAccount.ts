import UnlockProvider from '../services/unlockProvider'
import { useConfig } from '../utils/withConfig'
import { StorageService } from '../services/storageService'
import UnlockUser from '../structured_data/unlockUser'
import { useWedlockService } from '../contexts/WedlocksContext'
import { captureCharge } from './useCards'
import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '../utils/accounts'
import { ToastHelper } from '~/components/helpers/toast.helper'

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
  const wedlockService = useWedlockService()

  const createUserAccount = async (emailAddress: string, password: string) => {
    const storageService = new StorageService(config.services.storage.host)

    const { address, passwordEncryptedPrivateKey } =
      await createAccountAndPasswordEncryptKey(password)

    const { origin } = window.location

    let recoveryKey

    try {
      const data = await storageService.createUser(
        UnlockUser.build({
          emailAddress,
          publicKey: address,
          passwordEncryptedPrivateKey,
        })
      )
      const result = await data.json()
      if (!data.ok) {
        ToastHelper.error(result[0]?.message ?? 'Ops, something went wrong')
      } else {
        // TODO: we can do this without requiring the user to wait but that could be a bit unsafe, because what happens if they close the window?
        recoveryKey = await reEncryptPrivateKey(
          passwordEncryptedPrivateKey,
          password,
          result.recoveryPhrase
        )
        ToastHelper.success('Account successfully created')
      }
    } catch (error: any) {
      console.error(error)
      const details = error?.response?.data[0]
      if (
        details?.validatorKey === 'not_unique' &&
        details?.path === 'emailAddress'
      ) {
        throw new Error('ACCOUNT_ALREADY_EXISTS')
      } else {
        throw new Error('ACCOUNT_CREATION_FAILURE')
      }
    }

    await wedlockService.welcomeEmail(
      emailAddress,
      `${origin}/recover/?email=${encodeURIComponent(
        emailAddress
      )}&recoveryKey=${encodeURIComponent(JSON.stringify(recoveryKey))}`
    )

    return {
      address,
      passwordEncryptedPrivateKey,
    }
  }

  const retrieveUserAccount = async (email: string, password: string) => {
    const storageService = new StorageService(config.services.storage.host)
    const encryptedKey = await storageService.getUserPrivateKey(email)
    const unlockProvider = new UnlockProvider(config.networks[1])

    await unlockProvider.connect({
      key: encryptedKey,
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
    createUserAccount,
    retrieveUserAccount,
  }
}
export default useAccount
