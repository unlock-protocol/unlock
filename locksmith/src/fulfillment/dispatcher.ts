import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import logger from '../logger'

const config = require('../../config/config')
const { GAS_COST } = require('../utils/keyPricer')
const { getGasSettings } = require('../utils/gasSettings')

interface KeyToGrant {
  recipient: string
  manager?: string
  expiration?: number
}
export default class Dispatcher {
  async getPurchaser(network: number) {
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )
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
          const provider = new ethers.providers.JsonRpcProvider(
            network.publicProvider
          )
          const wallet = new ethers.Wallet(config.purchaserCredentials)
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

    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )

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

    await walletService.connect(provider, walletWithProvider)
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
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const wallet = new ethers.Wallet(config.purchaserCredentials, provider)

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
    lockAddress: string,
    owner: string,
    network: number,
    cb?: any
  ) {
    const walletService = new WalletService(networks)

    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )
    await walletService.connect(provider, walletWithProvider)

    return await walletService.purchaseKey(
      {
        lockAddress,
        owner,
      },
      {},
      cb
    )
  }

  async renewMembershipFor(
    network: number,
    lockAddress: string,
    keyId: string
  ) {
    const walletService = new WalletService(networks)
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )

    await walletService.connect(provider, walletWithProvider)

    // TODO: use team multisig here (based on network config) instead of purchaser address!
    const referrer = walletWithProvider.address

    // send tx with custom gas (Polygon estimates are too often wrong...)
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)
    return walletService.renewMembershipFor(
      {
        lockAddress,
        referrer,
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
  async signToken(network: number, lockAddress: string, tokenId: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].publicProvider
    )
    const web3Service = new Web3Service(networks)

    const account = await web3Service.ownerOf(lockAddress, tokenId, network)

    const payload = JSON.stringify({
      network,
      account,
      lockAddress,
      tokenId,
      timestamp: Date.now(),
    })

    const wallet = new ethers.Wallet(config.purchaserCredentials, provider)

    return [payload, await wallet.signMessage(payload)]
  }
}
