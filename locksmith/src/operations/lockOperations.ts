import networks from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Op } from 'sequelize'
import { UserTokenMetadata } from '../models'

export async function getKeyHolderMetadata(
  address: string,
  keyHolders: string[],
  network: number
) {
  const userTokenMetadata = await UserTokenMetadata.findAll({
    attributes: ['userAddress', 'data'],
    where: {
      chain: network,
      tokenAddress: address,
      userAddress: {
        [Op.in]: keyHolders.map((address) =>
          Normalizer.ethereumAddress(address)
        ),
      },
    },
  })
  return userTokenMetadata
}

export async function isSoldOut(
  address: string,
  chain: number,
  keysNeeded = 10
): Promise<boolean> {
  const web3Service = new Web3Service(networks)
  const keysAvailable = await web3Service.keysAvailable(address, chain)
  return keysAvailable.lte(keysNeeded) // true of keysAvailable smaller than keysNeeded
}

const lockOperations = {
  isSoldOut,
  getKeyHolderMetadata,
}

export default lockOperations
