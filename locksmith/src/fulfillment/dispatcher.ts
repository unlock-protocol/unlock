import { WalletService } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

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
    await walletService.connect(provider, walletWithProvider)

    return await walletService.grantKey(
      {
        lockAddress,
        recipient,
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

    return balance > gasPrice.mul(GAS_COST)
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
