import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import logger from '../logger'

const { ethers } = require('ethers')

const config = require('../../config/config')

namespace AuthorizedLockOperations {
  export const hasAuthorization = async (
    address: string,
    network: number
  ): Promise<boolean> => {
    const lockAddress = Normalizer.ethereumAddress(address)
    const web3Service = new Web3Service(networks)
    const keyGranterWallet = new ethers.Wallet(config.purchaserCredentials)
    try {
      const isKeyGranter = await web3Service.isKeyGranter(
        lockAddress,
        keyGranterWallet.address,
        network
      )
      return isKeyGranter
    } catch (error: any) {
      logger.error(
        `Could not check if lock ${lockAddress} authorized ${keyGranterWallet.address} to grant keys on ${network}. ${error.message}`
      )
      return false
    }
  }
}

export = AuthorizedLockOperations
