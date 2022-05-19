import { WalletService } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import logger from '../logger'

const config = require('../../config/config')
const { GAS_COST } = require('../utils/keyPricer')
const { getGasSettings } = require('../utils/gasSettings')

export default class Dispatcher {
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
              balance: ethers.utils.formatEther(balance),
            },
          ]
        } catch (error) {
          logger.error(error)
          return [network.id, {}]
        }
      })
    )
    // @ts-expect-error
    const entries = new Map(balances)
    return Object.fromEntries(entries)
  }

  /**
   * Called to grant key to user!
   */
  async grantKeys(
    lockAddress: string,
    recipients: string[],
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

    await walletService.connect(provider, walletWithProvider)
    return walletService.grantKeys(
      {
        lockAddress,
        recipients,
        transactionOptions,
      },
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
      cb
    )
  }

  async renewMembershipFor(
    network: number,
    lockAddress: string,
    keyId: number
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

    // get lock
    const lock = await walletService.getLockContract(lockAddress)

    // TODO: use team multisig here (based on network config) instead of purchaser address!
    const referrer = walletWithProvider.address

    // send tx with custom gas
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasSettings(network)
    return await lock.renewMembershipFor(keyId, referrer, {
      maxFeePerGas,
      maxPriorityFeePerGas,
    })
  }
}
