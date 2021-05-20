import { Web3Service } from '@unlock-protocol/unlock-js'
import * as Normalizer from '../utils/normalizer'

const { ethers } = require('ethers')

const { networks } = require('../networks')

const config = require('../../config/config')

namespace AuthorizedLockOperations {
  // eslint-disable-next-line import/prefer-default-export
  export const hasAuthorization = async (
    address: string,
    network: number
  ): Promise<boolean> => {
    const lockAddress = Normalizer.ethereumAddress(address)
    const web3Service = new Web3Service(networks)
    const keyGranterWallet = new ethers.Wallet(config.purchaserCredentials)

    return await web3Service.isKeyGranter(
      lockAddress,
      keyGranterWallet.address,
      network
    )
  }
}

export = AuthorizedLockOperations
