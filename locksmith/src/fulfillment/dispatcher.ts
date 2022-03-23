import { WalletService } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import logger from '../logger'

const { ethers } = require('ethers')
const config = require('../../config/config')
const { GAS_COST } = require('../utils/keyPricer')

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

    const feeData = await provider.getFeeData()
    const transactionOptions = {
      maxPriorityFeePerGas: null,
      maxFeePerGas: null,
      gasPrice: null,
    }
    if (network === 137) {
      // On polygon hardcode values
      transactionOptions.maxFeePerGas = ethers.utils.parseUnits('1000', 'gwei')
      transactionOptions.maxPriorityFeePerGas = ethers.utils.parseUnits(
        '500',
        'gwei'
      )
      // transactionOptions.gasPrice = ethers.utils.parseUnits('3000', 'gwei')
    } else if (feeData?.maxPriorityFeePerGas && feeData?.maxFeePerGas) {
      // We bump priority by 20% to increase speed of execution
      transactionOptions.maxFeePerGas = ethers.BigNumber.from('2')
      transactionOptions.maxPriorityFeePerGas =
        feeData.maxPriorityFeePerGas.mul(ethers.BigNumber.from('2'))
    } else if (feeData?.gasPrice) {
      transactionOptions.gasPrice = feeData.maxFeePerGas.mul(
        ethers.BigNumber.from('2')
      )
    }

    await walletService.connect(provider, walletWithProvider)
    return await walletService.grantKey(
      {
        lockAddress,
        recipient,
        // @ts-expect-error
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
