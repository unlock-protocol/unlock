import { WalletService } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import logger from '../logger'

const config = require('../../config/config')
const { GAS_COST } = require('../utils/keyPricer')

interface transactionOptionsInterface {
  maxPriorityFeePerGas?: ethers.BigNumber
  maxFeePerGas?: ethers.BigNumber
  gasPrice?: ethers.BigNumber
}

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

    const feeData = await provider.getFeeData().catch(() => null)

    const transactionOptions: transactionOptionsInterface = {}

    if (network === 137) {
      transactionOptions.maxPriorityFeePerGas = ethers.utils.parseUnits(
        '500',
        'gwei'
      )
      transactionOptions.maxFeePerGas = transactionOptions.maxPriorityFeePerGas
    } else if (feeData?.maxFeePerGas) {
      // We double to increase speed of execution
      // We may end up paying *more* but we get mined earlier
      transactionOptions.maxPriorityFeePerGas = feeData.maxFeePerGas.mul(
        ethers.BigNumber.from('2')
      )
      transactionOptions.maxFeePerGas = transactionOptions.maxPriorityFeePerGas
    } else if (feeData?.gasPrice) {
      transactionOptions.gasPrice = feeData.gasPrice.mul(
        ethers.BigNumber.from('2')
      )
    }

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
    return await lock.renewMembershipFor(keyId, walletWithProvider.address)
  }
}
