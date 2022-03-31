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
  /**
   * Called to grant key to user!
   */
  async grantKey(
    lockAddress: string,
    recipient: string,
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
      // Hardcode the fee for polygon
      transactionOptions.maxPriorityFeePerGas = ethers.utils.parseUnits(
        '20',
        'gwei'
      )
      transactionOptions.maxFeePerGas = ethers.utils.parseUnits('100', 'gwei')
    } else if (feeData?.maxPriorityFeePerGas) {
      // We double to increase speed of execution
      transactionOptions.maxPriorityFeePerGas =
        feeData.maxPriorityFeePerGas.mul(ethers.BigNumber.from('2'))
      transactionOptions.maxFeePerGas = feeData.maxPriorityFeePerGas.mul(
        ethers.BigNumber.from('2')
      )
    } else if (feeData?.gasPrice) {
      transactionOptions.gasPrice = feeData.gasPrice.mul(
        ethers.BigNumber.from('2')
      )
    }

    await walletService.connect(provider, walletWithProvider)
    return await walletService.grantKey(
      {
        lockAddress,
        recipient,
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
}
