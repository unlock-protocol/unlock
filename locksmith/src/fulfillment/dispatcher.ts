import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from 'defender-relay-client/lib/ethers'

import {
  KeyManager,
  WalletService,
  Web3Service,
} from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import logger from '../logger'
import { GAS_COST } from '../utils/constants'
import { getGasSettings } from '../utils/gasSettings'
import config from '../config/config'
import executeAndRetry from './retries'

interface KeyToGrant {
  recipient: string
  manager?: string
  expiration?: number
}

/**
 * Helper function to return a provider for a network id
 * @param network
 * @returns
 */
export const getProviderForNetwork = async function (network = 1) {
  return new ethers.providers.JsonRpcProvider(networks[network].publicProvider)
}

/**
 * Helper function that yields a provider and connected wallet based on the config
 * @param network
 * @returns
 */
export const getPurchaser = async function (network = 1) {
  const defenderRelayCredential = config.defenderRelayCredentials[network]
  if (defenderRelayCredential) {
    const provider = new DefenderRelayProvider(defenderRelayCredential)
    const wallet = new DefenderRelaySigner(defenderRelayCredential, provider, {
      speed: 'fast',
    })
    return { wallet, provider }
  }
  const provider = await getProviderForNetwork(network)
  const wallet = new ethers.Wallet(config.purchaserCredentials, provider)
  return {
    wallet,
    provider,
  }
}

export default class Dispatcher {
  /**
   * Return the purchaser's balances for each network
   * @returns
   */
  async balances() {
    const balances = await Promise.all(
      Object.values(networks).map(async (network: any) => {
        try {
          const { wallet, provider } = await getPurchaser(network.id)
          const address = await wallet.getAddress()
          const balance: ethers.BigNumberish =
            await Promise.race<ethers.BigNumberish>([
              new Promise((resolve) =>
                setTimeout(() => {
                  console.log(
                    `Could not retrieve balance on network ${network.id}`
                  )
                  resolve(0)
                }, 3000)
              ),
              provider.getBalance(address),
            ])
          return [
            network.id,
            {
              address,
              name: network.name,
              balance: ethers.utils.formatEther(balance),
            },
          ]
        } catch (error) {
          logger.error('Could not retrieve balance on network', {
            network,
            error,
          })
          return [network.id, {}]
        }
      })
    )
    // @ts-expect-error - map type
    const entries = new Map(balances)
    return Object.fromEntries(entries)
  }

  /**
   * Yields a boolean to indicate if the purchaser has enough funds to initiate a purchase
   * @param network
   * @returns
   */
  async hasFundsForTransaction(network: number): Promise<boolean> {
    const { wallet, provider } = await getPurchaser(network)

    const gasPrice = await provider.getGasPrice()
    const address = await wallet.getAddress()
    const balance = await provider.getBalance(address)
    if (balance.lt(gasPrice.mul(GAS_COST))) {
      logger.warn(
        `Purchaser ${address} does not have enough coins (${ethers.utils.formatUnits(
          balance,
          '18'
        )}) to pay for gas (${ethers.utils.formatUnits(
          gasPrice.mul(GAS_COST)
        )}) on ${network}`
      )
      return false
    }
    return true
  }

  /**
   * Function that lets the purchaser sign a to proove ownership of a token (personal_sign)
   * @param network
   * @param lockAddress
   * @param tokenId
   * @returns [payload: string, signature: string]
   */
  async signToken(
    network: number,
    lockAddress: string,
    tokenId: string,
    account?: string
  ) {
    if (!account) {
      const web3Service = new Web3Service(networks)
      account = await web3Service.ownerOf(lockAddress, tokenId, network)
    }

    const payload = JSON.stringify({
      network,
      account,
      lockAddress,
      tokenId,
      timestamp: Date.now(),
    })

    const { wallet } = await getPurchaser(network)

    return [payload, await wallet.signMessage(payload)]
  }

  /**
   * Yields a transfer code
   * @param network
   * @param params
   * @returns
   */
  async createTransferCode(
    network: number,
    params: Parameters<
      InstanceType<typeof KeyManager>['createTransferSignature']
    >[0]['params']
  ) {
    const { wallet } = await getPurchaser(network)
    const keyManager = new KeyManager()
    const transferCode = await keyManager.createTransferSignature({
      params,
      signer: wallet,
      network,
    })
    return transferCode
  }

  /**
   * Returns true if params was signed by locksmith
   */
  async isTransferSignedByLocksmith(
    network: number,
    params: Parameters<
      InstanceType<typeof KeyManager>['getSignerForTransferSignature']
    >[0]['params']
  ) {
    const { wallet } = await getPurchaser(network)

    const keyManager = new KeyManager()
    const transferSignerAddress = keyManager.getSignerForTransferSignature({
      network,
      params,
    })
    const walletAddress = await wallet.getAddress()
    const isSignedByLocksmith =
      transferSignerAddress.trim().toLowerCase() ===
      walletAddress.trim().toLowerCase()

    return isSignedByLocksmith
  }

  /** Sends a purchase transaction */
  async purchaseKey(
    options: {
      lockAddress: string
      owner: string
      network: number
      data?: string
      keyManager?: string
    },
    cb?: (error: any, hash: string | null) => Promise<unknown>
  ) {
    const { network, lockAddress, owner, data, keyManager } = options
    const walletService = new WalletService(networks)

    const { wallet, provider } = await getPurchaser(network)

    await walletService.connect(provider, wallet)

    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)

    return executeAndRetry(
      walletService.purchaseKey(
        {
          lockAddress,
          owner,
          data,
          keyManager,
        },
        { maxFeePerGas, maxPriorityFeePerGas },
        cb
      )
    )
  }

  /** Sends a transaction to renew an existing NFT memvership */
  async renewMembershipFor(
    network: number,
    lockAddress: string,
    keyId: string
  ) {
    const walletService = new WalletService(networks)

    const { wallet, provider } = await getPurchaser(network)

    await walletService.connect(provider, wallet)

    const referrer = networks[network]?.multisig

    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)
    return executeAndRetry(
      walletService.renewMembershipFor(
        {
          lockAddress,
          referrer: referrer!,
          tokenId: keyId,
        },
        { maxFeePerGas, maxPriorityFeePerGas }
      )
    )
  }

  /**
   * Grants an extension for an existing NFT membership
   * @param lockAddress
   * @param keyId
   * @param network
   * @param callback
   */
  async grantKeyExtension(
    lockAddress: string,
    keyId: number,
    network: number,
    callback: (error: any, hash: string | null) => Promise<void>
  ) {
    const walletService = new WalletService(networks)
    const { wallet, provider } = await getPurchaser(network)
    await walletService.connect(provider, wallet)
    return executeAndRetry(
      walletService.grantKeyExtension(
        {
          lockAddress,
          tokenId: keyId.toString(),
          duration: 0,
        },
        {} /** TransactionOptions */,
        callback
      )
    )
  }

  /**
   * Extends an existing NFT membership
   * @param lockAddress
   * @param keyId
   * @param network
   * @param callback
   */
  async extendKey(
    lockAddress: string,
    keyId: number,
    network: number,
    data: string,
    callback: (error: any, hash: string | null) => Promise<unknown>
  ) {
    const walletService = new WalletService(networks)
    const { wallet, provider } = await getPurchaser(network)
    await walletService.connect(provider, wallet)
    return executeAndRetry(
      walletService.extendKey(
        {
          lockAddress,
          tokenId: keyId.toString(),
          data,
        },
        {} /** TransactionOptions */,
        callback
      )
    )
  }

  /**
   * Called to grant key to user!
   */
  async grantKeys(
    lockAddress: string,
    keys: KeyToGrant[],
    network: number,
    cb?: any
  ) {
    const walletService = new WalletService(networks)

    const { wallet, provider } = await getPurchaser(network)

    const transactionOptions = await getGasSettings(network)

    const teamMultisig = networks[network]?.multisig

    const recipients: string[] = []
    const keyManagers: string[] = []
    const expirations: string[] = []
    keys.forEach(({ recipient, manager, expiration }) => {
      recipients.push(recipient)
      if (manager) {
        keyManagers.push(manager)
      } else if (teamMultisig) {
        keyManagers.push(teamMultisig)
      }
      if (expiration) {
        expirations.push(expiration.toString())
      }
    })

    await walletService.connect(provider, wallet)
    return executeAndRetry(
      walletService.grantKeys(
        {
          lockAddress,
          recipients,
          keyManagers,
          expirations,
        },
        transactionOptions,
        cb
      )
    )
  }

  /** Deploys a lock */
  async createLockContract(
    network: number,
    options: Parameters<InstanceType<typeof WalletService>['createLock']>[0],
    callback: (error: any, hash: string | null) => Promise<void> | void
  ) {
    const { wallet, provider } = await getPurchaser(network)
    const walletService = new WalletService(networks)
    await walletService.connect(provider, wallet)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)

    return executeAndRetry(
      walletService.createLock(
        options,
        { maxFeePerGas, maxPriorityFeePerGas },
        callback
      )
    )
  }

  async buyWithCardPurchaser(
    network: number,
    lockAddress: string,
    recipients: string[],
    transfer: any,
    purchase: any,
    purchaseData: any
  ) {
    const walletService = new WalletService(networks)
    const { wallet, provider } = await getPurchaser(network)
    await walletService.connect(provider, wallet)

    const referrer = networks[network]?.multisig
    const teamMultisig = networks[network]?.multisig

    // Construct the transaction
    // ! We should ideally do that in  unlock-js!
    const lockContract = await walletService.getLockContract(lockAddress)
    const keyPrices = await Promise.all(
      recipients.map(async (recipient, index) => {
        return lockContract.purchasePriceFor(
          recipient,
          referrer,
          purchaseData[index] || []
        )
      })
    )

    const transaction = await lockContract.populateTransaction.purchase(
      keyPrices,
      recipients,
      recipients.map(() => referrer),
      recipients.map(() => teamMultisig),
      purchaseData
    )

    if (!transaction.data) {
      throw new Error('Missing transaction data')
    }

    return walletService.purchaseWithCardPurchaser({
      transfer,
      purchase,
      callData: transaction.data,
    })
  }
}
