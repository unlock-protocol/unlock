import {
  KeyManager,
  WalletService,
  Web3Service,
} from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import logger from '../logger'
import { GAS_COST } from '../utils/keyPricer'
import { getGasSettings } from '../utils/gasSettings'
import config from '../config/config'

interface KeyToGrant {
  recipient: string
  manager?: string
  expiration?: number
}
export default class Dispatcher {
  getProviderForNetwork(network: number) {
    return new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )
  }

  /**
   * function that yields a provider and connected wallet based on the config
   * @param network
   * @returns
   */
  async getPurchaser(network: number) {
    const provider = this.getProviderForNetwork(network)
    const wallet = new ethers.Wallet(config.purchaserCredentials, provider)
    return {
      wallet,
      provider,
    }
  }

  async balances() {
    const balances = await Promise.all(
      Object.values(networks).map(async (network: any) => {
        try {
          const { wallet, provider } = await this.getPurchaser(network.id)
          const balance = await provider.getBalance(wallet.address)
          return [
            network.id,
            {
              address: wallet.address,
              name: network.name,
              balance: ethers.utils.formatEther(balance),
            },
          ]
        } catch (error) {
          logger.error(error)
          return [network.id, {}]
        }
      })
    )
    // @ts-expect-error - map type
    const entries = new Map(balances)
    return Object.fromEntries(entries)
  }

  async grantKeyExtension(
    lockAddress: string,
    keyId: number,
    network: number,
    callback: (error: any, hash: string | null) => Promise<void>
  ) {
    const walletService = new WalletService(networks)
    const { wallet, provider } = await this.getPurchaser(network)
    await walletService.connect(provider, wallet)
    await walletService.grantKeyExtension(
      {
        lockAddress,
        tokenId: keyId.toString(),
        duration: 0,
      },
      {} /** TransactionOptions */,
      callback
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

    const { wallet, provider } = await this.getPurchaser(network)

    const transactionOptions = await getGasSettings(network)

    const teamMultisig = networks[network]?.teamMultisig

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
    return walletService.grantKeys(
      {
        lockAddress,
        recipients,
        keyManagers,
        expirations,
      },
      transactionOptions,
      cb
    )
  }

  async hasFundsForTransaction(network: number) {
    const { wallet, provider } = await this.getPurchaser(network)

    const gasPrice = await provider.getGasPrice()

    const balance = await provider.getBalance(wallet.address)
    if (balance.lt(gasPrice.mul(GAS_COST))) {
      logger.warn(
        `Purchaser ${
          wallet.address
        } does not have enough coins (${ethers.utils.formatUnits(
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

  async purchaseKey(
    options: {
      lockAddress: string
      owner: string
      network: number
      data?: string
    },
    cb?: any
  ) {
    const { network, lockAddress, owner, data } = options
    const walletService = new WalletService(networks)

    const { wallet, provider } = await this.getPurchaser(network)

    await walletService.connect(provider, wallet)

    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)

    return await walletService.purchaseKey(
      {
        lockAddress,
        owner,
        data,
      },
      { maxFeePerGas, maxPriorityFeePerGas },
      cb
    )
  }

  async renewMembershipFor(
    network: number,
    lockAddress: string,
    keyId: string
  ) {
    const walletService = new WalletService(networks)

    const { wallet, provider } = await this.getPurchaser(network)

    await walletService.connect(provider, wallet)

    const referrer = networks[network]?.teamMultisig

    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)
    return walletService.renewMembershipFor(
      {
        lockAddress,
        referrer: referrer!,
        tokenId: keyId,
      },
      { maxFeePerGas, maxPriorityFeePerGas }
    )
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

    const { wallet } = await this.getPurchaser(network)

    return [payload, await wallet.signMessage(payload)]
  }

  async createLockContract(
    network: number,
    options: Parameters<InstanceType<typeof WalletService>['createLock']>[0],
    callback: (error: any, hash: string | null) => Promise<void> | void
  ) {
    const { wallet, provider } = await this.getPurchaser(network)
    const walletService = new WalletService(networks)
    await walletService.connect(provider, wallet)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)

    return walletService.createLock(
      options,
      { maxFeePerGas, maxPriorityFeePerGas },
      callback
    )
  }

  async createTransferCode(
    network: number,
    params: Parameters<
      InstanceType<typeof KeyManager>['createTransferSignature']
    >[0]['params']
  ) {
    const { wallet } = await this.getPurchaser(network)
    const keyManager = new KeyManager()
    const transferCode = await keyManager.createTransferSignature({
      params,
      signer: wallet,
      network,
    })
    return transferCode
  }

  async isTransferSignedByLocksmith(
    network: number,
    params: Parameters<
      InstanceType<typeof KeyManager>['getSignerForTransferSignature']
    >[0]['params']
  ) {
    const { wallet } = await this.getPurchaser(network)

    const keyManager = new KeyManager()
    const transferSignerAddress = keyManager.getSignerForTransferSignature({
      network,
      params,
    })
    const isSignedByLocksmith =
      transferSignerAddress.trim().toLowerCase() ===
      wallet.address.trim().toLowerCase()

    return isSignedByLocksmith
  }
}
