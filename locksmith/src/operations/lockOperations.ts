import * as Normalizer from '../utils/normalizer'
import { Op } from 'sequelize'
import { UserTokenMetadata, LockMetadata, LockIcons } from '../models'
import parseDataUri from 'parse-data-uri'
import lockIconUtils from '../utils/lockIcon'
import { ticketForFilBangalore } from '../utils/ticket'
import { getWeb3Service } from '../initializers'

interface IconType {
  icon: string
  type: string | null
  isURL: boolean
}

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
  keysNeeded = 1
): Promise<boolean> {
  const web3Service = getWeb3Service()
  const keysAvailable = await web3Service.keysAvailable(address, chain)
  return keysAvailable < keysNeeded // true of keysAvailable smaller than keysNeeded
}

export const getGeneratedLockIcon = (lockAddress: string): IconType => {
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
}): Promise<IconType> => {
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

export const getKeyIcon = async ({
  network,
  lockAddress,
  keyId,
}: {
  network: number
  lockAddress: string
  keyId: string
}): Promise<IconType | null> => {
  // Temporary icon for FilBangalore
  if (
    network == 42161 &&
    lockAddress.toLowerCase() === '0x02c510bE69fe87E052E065D8A40B437d55907B48'
  ) {
    const icon = await ticketForFilBangalore({
      network,
      lockAddress,
      tokenId: keyId,
    })

    return { type: 'image/svg+xml', icon, isURL: false }
  }
  return null
}

const lockOperations = {
  isSoldOut,
  getKeyHolderMetadata,
}

export default lockOperations
