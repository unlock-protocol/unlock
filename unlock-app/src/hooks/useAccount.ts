import UnlockProvider from '../services/unlockProvider'
import { useConfig } from '../utils/withConfig'
import { StorageService } from '../services/storageService'
import { useWalletService } from '../utils/withWalletService'
import UnlockUser from '../structured_data/unlockUser'
import { useWedlockService } from '../contexts/WedlocksContext'
import {
  generateTypedData,
  claimMembership,
  prepareCharge,
  captureCharge,
} from './useCards'
import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '../utils/accounts'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { storage } from '~/config/storage'

interface ApiResponse {
  url: string
}

export const getAccountTokenBalance = async (
  web3Service: any,
  accountAddress: string,
  contractAddress: string | null,
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
  const walletService = useWalletService()
  const wedlockService = useWedlockService()

  // TODO: move to new API with auth token instead of signature
  const connectStripeToLock = async (
    lockAddress: string,
    network: number,
    baseUrl: string
  ) => {
    const storageService = new StorageService(config.services.storage.host)
    const typedData = generateTypedData(
      {
        'Connect Stripe': {
          lockAddress,
          chain: network,
          lockManager: address,
          baseUrl,
        },
      },
      'Connect Stripe'
    )

    const message = `I want to connect Stripe to the lock ${lockAddress}`
    const signature = await walletService.signMessage(message, 'personal_sign')

    try {
      return (
        (await storageService.getStripeConnect(
          lockAddress,
          signature,
          typedData
        )) as ApiResponse
      ).url
    } catch (error) {
      return null
    }
  }

  const disconnectStripeFromLock = async ({
    lockAddress,
    network,
  }: {
    lockAddress: string
    network: number
  }) => {
    try {
      const response = await storage.disconnectStripe(network, lockAddress)
      return response.status
    } catch (error) {
      return null
    }
  }

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

  /**
   * Prepares a charge on the backend
   * @param token
   * @param lock
   * @param network
   * @param pricing
   * @param recipient
   * @returns
   */
  const prepareChargeForCard = async (
    token: string,
    lock: any,
    network: number,
    pricing: any,
    recipients: string[],
    recurring = 0
  ) => {
    const response = await prepareCharge(
      config,
      walletService,
      address,
      token,
      network,
      lock,
      pricing,
      recipients,
      recurring
    )
    return response
  }

  const claimMembershipFromLock = async (
    lock: any,
    network: number,
    data?: string,
    captcha?: string
  ) => {
    const response = await claimMembership(
      config,
      walletService,
      address,
      network,
      lock,
      data,
      captcha
    )
    return response
  }

  return {
    captureChargeForCard,
    prepareChargeForCard,
    connectStripeToLock,
    createUserAccount,
    retrieveUserAccount,
    claimMembershipFromLock,
    disconnectStripeFromLock,
  }
}
export default useAccount
