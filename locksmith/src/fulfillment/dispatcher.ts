import { Defender } from '@openzeppelin/defender-sdk'

import { KeyManager, WalletService } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import logger from '../logger'
import { GAS_COST } from '../utils/constants'
import { getGasSettings } from '../utils/gasSettings'
import config from '../config/config'
import executeAndRetry from './retries'
import normalizer from '../utils/normalizer'
import { getWeb3Service } from '../initializers'

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
  return new ethers.JsonRpcProvider(networks[network].provider)
}

/**
 * Helper function to return the public provider for a network id
 * (used to send tx only!)
 * @param network
 * @returns
 */
export const getPublicProviderForNetwork = async function (network = 1) {
  return new ethers.JsonRpcProvider(networks[network].publicProvider)
}

interface PurchaserArgs {
  network: number
  address?: string
}

// Helper function to get the local purchaser, if the address does not matter
export const getLocalPurchaser = async function ({ network = 1 }) {
  const provider = await getPublicProviderForNetwork(network)
  const wallet = new ethers.Wallet(config.purchaserCredentials, provider)
  return wallet
}

/**
 * Helper function that yields a provider and connected wallet based on the config
 * @param network
 * @returns
 */
export const getPurchaser = async function ({
  network = 1,
  address = undefined,
}: PurchaserArgs): Promise<ethers.Signer> {
  // If we have a provider, we need to fetch that one... or yield an error!
  const defenderRelayCredential = config.defenderRelayCredentials[network]
  if (
    defenderRelayCredential?.relayerApiKey &&
    defenderRelayCredential?.relayerApiSecret
  ) {
    const defender = new Defender(defenderRelayCredential)
    const provider = defender.relaySigner.getProvider()
    const wallet = await defender.relaySigner.getSigner(provider, {
      speed: 'fast',
    })
    // @ts-expect-error - polyfill
    if (!wallet.signTypedData) {
      // @ts-expect-error - polyfill
      wallet.signTypedData = wallet._signTypedData
    }
    if (!address || address === (await wallet.getAddress())) {
      const relayerStatus = await defender.relaySigner.getRelayerStatus()
      if (!relayerStatus.paused) {
        return wallet as unknown as ethers.Signer
      } else {
        logger.warn(
          `The OpenZeppelin Relayer purchaser at ${address} is paused! We will use the local purchaser instead.`
        )
      }
    }
  }
  const provider = await getPublicProviderForNetwork(network)
  const wallet = new ethers.Wallet(config.purchaserCredentials, provider)
  if (!address || address === (await wallet.getAddress())) {
    return wallet as ethers.Signer
  }
  throw new Error(`The purchaser at ${address} is unavailable!`)
}

/**
 * Helper function that yields a provider and connected wallet based on the config
 * @param network
 * @returns
 */
export const getAllPurchasers = async function ({
  network = 1,
}: PurchaserArgs) {
  const purchasers = []
  const defenderRelayCredential = config.defenderRelayCredentials[network]
  if (
    defenderRelayCredential?.relayerApiKey &&
    defenderRelayCredential?.relayerApiSecret
  ) {
    const defender = new Defender(defenderRelayCredential)
    const provider = defender.relaySigner.getProvider()
    const wallet = await defender.relaySigner.getSigner(provider, {
      speed: 'fast',
    })
    // @ts-expect-error - polyfill
    if (!wallet.signTypedData) {
      // @ts-expect-error - polyfill
      wallet.signTypedData = wallet._signTypedData
    }
    purchasers.push(wallet)
  }
  const provider = await getPublicProviderForNetwork(network)
  const wallet = new ethers.Wallet(config.purchaserCredentials, provider)
  purchasers.push(wallet)
  return purchasers
}

/**
 * Helper function that yields the signer for the hook on a lock.
 * The Hook needs to support the signers function that given an address, yields a boolean
 * if the address is a signer
 * @param param0
 * @returns
 */
export const getSignerFromOnKeyPurchaserHookOnLock = async function ({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) {
  const web3Service = getWeb3Service()
  const hookAddress = await web3Service.onKeyPurchaseHook({
    lockAddress,
    network,
  })

  const purchasers = await getAllPurchasers({ network })
  const provider = await getPublicProviderForNetwork(network)

  const hook = new ethers.Contract(
    hookAddress,
    ['function signers(address signer) constant view returns (bool)'],
    provider
  )

  let wallet = null

  // Ok let's now select a purchaser that is set as signer, or throw an Error!
  // Can we do Promise.all to reduce latency?
  for (let i = 0; i < purchasers.length; i++) {
    const purchaserAddress = await purchasers[i].getAddress()
    const isSigner = await hook.signers(purchaserAddress).catch((e: any) => {
      logger.error(e)
      return false
    })
    if (isSigner) {
      wallet = purchasers[i]
      break
    }
  }
  if (!wallet) {
    logger.error(
      `None of the locksmiths purchasers are signers on the hook at ${hookAddress} on ${network}`
    )
  }
  return wallet
}

/**
 * Helper function that yields the signer who is a key granter on a lock.
 * @param param0
 * @returns
 */
export const getSignerWhoIsKeyGranterOnLock = async function ({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) {
  const web3Service = getWeb3Service()

  const purchasers = await getAllPurchasers({ network })
  const keyGranters = await Promise.all(
    purchasers.map(async (purchaser) => {
      if (
        await web3Service.isKeyGranter(
          lockAddress,
          await purchaser.getAddress(),
          network
        )
      ) {
        return purchaser
      }
      return null
    })
  )
  return keyGranters.find((purchaser) => purchaser !== null)
}

export default class Dispatcher {
  /**
   * Return the purchaser's balances for each network
   * @returns
   */
  async balances() {
    const balances = await Promise.all(
      Object.values(networks)
        .filter((network) => network.name !== 'localhost')
        .map(async (network: any) => {
          try {
            const [provider, wallet] = await Promise.all([
              getProviderForNetwork(network.id),
              getPurchaser({ network: network.id }),
            ])
            const address = await wallet.getAddress()
            let timeout
            const balance: ethers.BigNumberish =
              await Promise.race<ethers.BigNumberish>([
                new Promise(
                  (resolve) =>
                    (timeout = setTimeout(() => {
                      logger.error(
                        `Timeout while retrieving balance on network ${network.name} (${network.id})`
                      )
                      resolve(0)
                    }, 3000))
                ),
                provider.getBalance(address),
              ])
            clearTimeout(timeout) // clears timeout
            return [
              network.id,
              {
                address,
                name: network.name,
                balance: ethers.formatEther(balance),
              },
            ]
          } catch (error) {
            logger.error(
              `Could not retrieve balance on network ${network.name} (${network.id}) `,
              {
                error,
              }
            )
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
  async hasFundsForTransaction(
    network: number,
    purchaser?: string
  ): Promise<boolean> {
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getPurchaser({ network, address: purchaser }),
    ])
    const address = await wallet.getAddress()
    const [feeData, balance] = await Promise.all([
      provider.getFeeData(),
      provider.getBalance(address),
    ])
    if (balance < (feeData.gasPrice || BigInt(0)) * GAS_COST) {
      logger.warn(
        `Purchaser ${address} does not have enough coins (${ethers.formatUnits(
          balance,
          '18'
        )}) to pay for gas (${ethers.formatUnits(
          (feeData.gasPrice || BigInt(0)) * GAS_COST
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
      const web3Service = getWeb3Service()
      account = await web3Service.ownerOf(lockAddress, tokenId, network)
    }

    const payload = JSON.stringify({
      network,
      account,
      lockAddress,
      tokenId,
      timestamp: Date.now(),
    })

    const wallet = await getPurchaser({ network })

    return [payload, await wallet.signMessage(payload)]
  }

  /**
   * Yields a transfer code for walletless airdrops.
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
    const keyManager = new KeyManager()
    const purchasers = await getAllPurchasers({ network })
    const signers = await Promise.all(
      purchasers.map(async (purchaser) => {
        if (await keyManager.isSigner(network, await purchaser.getAddress())) {
          return purchaser
        }
        return null
      })
    )
    const signer = signers.find(
      (purchaser) => purchaser !== null
    ) as ethers.Signer

    if (!signer) {
      throw new Error(
        'No signer is set as locksmith on the Key Manager contract'
      )
    }

    const transferCode = await keyManager.createTransferSignature({
      params,
      signer,
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
    const keyManager = new KeyManager()
    const transferSignerAddress = keyManager.getSignerForTransferSignature({
      network,
      params,
    })
    try {
      const wallet = await getPurchaser({
        network,
        address: transferSignerAddress, // we get the signer at that address! (this throws if the signer does not match!)
      })
      const walletAddress = await wallet.getAddress()
      const isSignedByLocksmith =
        normalizer.ethereumAddress(transferSignerAddress) ===
        normalizer.ethereumAddress(walletAddress)
      return isSignedByLocksmith
    } catch (error) {
      logger.error(`We could not find a signer for ${transferSignerAddress}`, {
        error,
      })
      return false
    }
  }

  /** Sends a purchase transaction */
  async purchaseKey(
    options: {
      lockAddress: string
      owner: string
      network: number
      data?: string
      keyManager?: string
      referrer?: string
    },
    cb?: (error: any, hash: string | null) => Promise<unknown>
  ) {
    const { network, lockAddress, owner, data, keyManager, referrer } = options
    const walletService = new WalletService(networks)

    // get any purchaser, as a specific address is not required here.
    // we also use the local purchaser, because these are low value transactions
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getLocalPurchaser({ network }),
    ])
    await walletService.connect(provider, wallet)

    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)

    return executeAndRetry(
      walletService.purchaseKey(
        {
          lockAddress,
          owner,
          data,
          keyManager,
          referrer,
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

    // Get any purchaser, as the address does not matter
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getPurchaser({ network }),
    ])

    await walletService.connect(provider, wallet as ethers.Signer)

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

    // Get a purchaser that is a key granter!
    const wallet = (await getSignerWhoIsKeyGranterOnLock({
      lockAddress,
      network,
    })) as ethers.Signer
    if (!wallet) {
      throw new Error('No signer set as key granter on this lock!')
    }
    const provider = await getPublicProviderForNetwork(network)

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
    // get any purchaser here as the address does not matter
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getPurchaser({ network }),
    ])
    await walletService.connect(provider, wallet as ethers.Signer)
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

    // Get a purchaser that is a key granter
    const wallet = (await getSignerWhoIsKeyGranterOnLock({
      lockAddress,
      network,
    })) as ethers.Signer
    if (!wallet) {
      throw new Error('No signer set as key granter on this lock!')
    }
    const provider = await getPublicProviderForNetwork(network)

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
    // purchaser does not matter here
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getPurchaser({ network }),
    ])
    const walletService = new WalletService(networks)
    await walletService.connect(provider, wallet as ethers.Signer)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)

    return executeAndRetry(
      walletService.createLock(
        options,
        { maxFeePerGas, maxPriorityFeePerGas },
        callback
      )
    )
  }

  /**
   * This function is called to purchase a key using universal cards.
   * @param network
   * @param lockAddress
   * @param recipients
   * @param transfer
   * @param purchase
   * @param purchaseData
   * @returns
   */
  async buyWithCardPurchaser(
    network: number,
    lockAddress: string,
    recipients: string[],
    transfer: any,
    purchase: any,
    purchaseData: any
  ) {
    const walletService = new WalletService(networks)
    // get any purchaser, as the sender of this transaction does not matter
    const [provider, wallet] = await Promise.all([
      getProviderForNetwork(network),
      getPurchaser({ network }),
    ])
    await walletService.connect(provider, wallet as ethers.Signer)

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

    const transaction = await lockContract.purchase.populateTransaction(
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
