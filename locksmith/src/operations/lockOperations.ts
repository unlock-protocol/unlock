import networks from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Op } from 'sequelize'
import { UserTokenMetadata, LockMetadata, LockIcons } from '../models'
import parseDataUri from 'parse-data-uri'
import lockIconUtils from '../utils/lockIcon'

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

export const getGeneratedLockIcon = (lockAddress: string) => {
  const svg = lockIconUtils.lockIcon(lockAddress)
  return {
    icon: svg,
    type: 'image/svg+xml',
    isURL: false,
  }
}

export const getLockIcon = async ({
  lockAddress,
  original,
  requestUrl,
}: {
  lockAddress: string
  original?: boolean
  requestUrl: string
}) => {
  if (original) {
    return getGeneratedLockIcon(lockAddress)
  }

  try {
    const lockMetadata = await LockMetadata.findOne({
      where: {
        address: lockAddress,
      },
    })

    const lockImageUrl = lockMetadata?.data?.image

    if (lockImageUrl) {
      const isSelfReferencing =
        Normalizer.url(lockImageUrl) === Normalizer.url(requestUrl)
      if (!isSelfReferencing) {
        return {
          icon: lockImageUrl,
          type: null,
          isURL: true,
        }
      }
    }

    const lockIcon = await LockIcons.findOne({
      where: { lock: lockAddress },
    })

    if (lockIcon) {
      if (lockIcon.icon.startsWith('data:')) {
        const parsedDataUri = parseDataUri(lockIcon.icon)
        return {
          icon: parsedDataUri.data,
          type: parsedDataUri.mimeType,
          isURL: false,
        }
      } else {
        return {
          icon: lockIcon.icon,
          type: null,
          isURL: true,
        }
      }
    } else {
      throw new Error('No lock icon found')
    }
  } catch {
    return getGeneratedLockIcon(lockAddress)
  }
}

const lockOperations = {
  isSoldOut,
  getKeyHolderMetadata,
}

export default lockOperations
