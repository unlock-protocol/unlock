import UnlockProvider from '../services/unlockProvider'
import { useWeb3Service } from '../utils/withWeb3Service'
import { useConfig } from '../utils/withConfig'
import { StorageService } from '../services/storageService'
import { useWalletService } from '../utils/withWalletService'
import UnlockUser from '../structured_data/unlockUser'
import { generateKeyHolderMetadataPayload } from '../structured_data/keyHolderMetadata'
import { useWedlockService } from '../contexts/WedlocksContext'
import {
  generateTypedData,
  getCardsForAddress,
  chargeAndSaveCard,
  claimMembership,
  prepareCharge,
  captureCharge,
} from './useCards'
import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '../utils/accounts'

interface ApiResponse {
  url: string
}

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
  const web3Service = useWeb3Service()
  const config = useConfig()
  const walletService = useWalletService()
  const wedlockService = useWedlockService()

  const getTokenBalance = (tokenAddress: string) => {
    return getAccountTokenBalance(web3Service, address, tokenAddress, network)
  }

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

  const createUserAccount = async (emailAddress: string, password: string) => {
    const storageService = new StorageService(config.services.storage.host)

    const { address, passwordEncryptedPrivateKey } =
      await createAccountAndPasswordEncryptKey(password)

    const { origin } = window.location

    let recoveryKey

    try {
      const response = await storageService.createUser(
        UnlockUser.build({
          emailAddress,
          publicKey: address,
          passwordEncryptedPrivateKey,
        })
      )
      const data = await response.json()
      // TODO: we can do this without requiring the user to wait but that could be a bit unsafe, because what happens if they close the window?
      recoveryKey = await reEncryptPrivateKey(
        passwordEncryptedPrivateKey,
        password,
        data.recoveryPhrase
      )
    } catch (error: any) {
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

    wedlockService.welcomeEmail(
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
    const unlockProvider = new UnlockProvider(config.networks[network])

    await unlockProvider.connect({
      key: encryptedKey,
      emailAddress: email,
      password,
    })
    return unlockProvider
  }

  const getCards = () => {
    return getCardsForAddress(config, walletService, address)
  }

  const chargeCard = async (
    token: string,
    lock: any,
    network: number,
    pricing: any,
    recipients: string[]
  ) => {
    const response = await chargeAndSaveCard(
      config,
      walletService,
      address,
      token,
      network,
      lock,
      pricing,
      recipients
    )
    return response.transactionHash
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
    recipients: string[]
  ) => {
    const response = await prepareCharge(
      config,
      walletService,
      address,
      token,
      network,
      lock,
      pricing,
      recipients
    )
    return response
  }

  const claimMembershipFromLock = async (lock: any, network: number) => {
    const response = await claimMembership(
      config,
      walletService,
      address,
      network,
      lock
    )
    return response.transactionHash
  }

  const setUserMetadataData = async (
    lockAddress: string,
    metadata: any,
    network: number
  ) => {
    const payload = generateKeyHolderMetadataPayload(address, metadata)
    // TODO prevent replays by adding timestamp?
    const message = `I am signing the metadata for the lock at ${lockAddress}`
    const signature = await walletService.signMessage(message, 'personal_sign')

    const storageService = new StorageService(config.services.storage.host)

    const response = await storageService.setUserMetadataData(
      lockAddress,
      address,
      payload,
      signature,
      network
    )
    return response
  }

  /**
   * Updates the icon on a lock
   * @param lockAddress
   * @param network
   * @param icon
   * @returns
   */
  const updateLockIcon = async (
    lockAddress: string,
    network: number,
    icon: string
  ) => {
    const storageService = new StorageService(config.services.storage.host)
    const typedData = generateTypedData(
      {
        'Update Icon': {
          lockAddress,
          chain: network,
          lockManager: address,
        },
      },
      'Update Icon'
    )

    const message = `I want to change the image for ${lockAddress}`
    const signature = await walletService.signMessage(message, 'personal_sign')

    return storageService.updateLockIcon(
      lockAddress,
      signature,
      typedData,
      icon
    )
  }

  return {
    setUserMetadataData,
    getTokenBalance,
    getCards,
    chargeCard,
    captureChargeForCard,
    prepareChargeForCard,
    connectStripeToLock,
    createUserAccount,
    retrieveUserAccount,
    claimMembershipFromLock,
    updateLockIcon,
  }
}
export default useAccount
