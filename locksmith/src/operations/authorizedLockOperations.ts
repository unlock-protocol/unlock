import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import logger from '../logger'
import { getPurchaser } from '../fulfillment/dispatcher'

export const hasAuthorization = async (
  address: string,
  network: number
): Promise<boolean> => {
  const lockAddress = Normalizer.ethereumAddress(address)
  const web3Service = new Web3Service(networks)

  const { wallet } = await getPurchaser(network)

  const purchaserAddress = await wallet.getAddress()

  try {
    const isKeyGranter = await web3Service.isKeyGranter(
      lockAddress,
      purchaserAddress,
      network
    )
    return isKeyGranter
  } catch (error: any) {
    logger.error(
      `Could not check if lock ${lockAddress} authorized ${purchaserAddress} to grant keys on ${network}. ${error.message}`
    )
    return false
  }
}

const AuthorizedLockOperations = {
  hasAuthorization,
}

export default AuthorizedLockOperations
