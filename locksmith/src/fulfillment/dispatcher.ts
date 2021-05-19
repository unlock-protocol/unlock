import { WalletService } from '@unlock-protocol/unlock-js'

const { ethers } = require('ethers')
const { networks } = require('../networks')
const config = require('../../config/config')

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
      networks[network].provider
    )

    const walletWithProvider = new ethers.Wallet(
      config.purchaserCredentials,
      provider
    )
    await walletService.connect(provider, walletWithProvider)

    // TODO: consider result of this transaction!
    // and store hash
    return await walletService.grantKey(
      {
        lockAddress,
        recipient,
      },
      cb
    )
  }
}
