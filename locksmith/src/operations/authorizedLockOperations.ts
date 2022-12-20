import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import logger from '../logger'
import { ethers } from 'ethers'
import config from '../config/config'

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

const AuthorizedLockOperations = {
  hasAuthorization,
}

export default AuthorizedLockOperations
