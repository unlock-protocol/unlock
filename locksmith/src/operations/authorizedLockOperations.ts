import { Web3Service } from '@unlock-protocol/unlock-js'
import * as Normalizer from '../utils/normalizer'

const { ethers } = require('ethers')

const { networks } = require('../networks')

const config = require('../../config/config')
const logger = require('../logger')

namespace AuthorizedLockOperations {
  // eslint-disable-next-line import/prefer-default-export
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
      if (!isKeyGranter) {
        logger.error(
          'AuthorizedLockOperations.hasAuthorization',
          `${keyGranterWallet.address} is not a key granter for ${lockAddress} on ${network}`
        )
      }
      return isKeyGranter
    } catch (error) {
      logger.error(
        `Could not check if lock ${lockAddress} authorized ${keyGranterWallet.address} to grant keys on ${network}. ${error.message}`
      )
      return false
    }
  }
}

export = AuthorizedLockOperations
