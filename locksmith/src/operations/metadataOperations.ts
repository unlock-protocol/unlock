import { KeyMetadata } from '../models/keyMetadata'
import { LockMetadata } from '../models/lockMetadata'
import Metadata from '../../config/metadata'
import KeyData from '../utils/keyData'
import { getMetadata } from './userMetadataOperations'

const Asset = require('../utils/assets')

const baseURIFragement = 'https://assets.unlock-protocol.com'

export const updateKeyMetadata = async (data: any) => {
  try {
    await KeyMetadata.upsert(data, { returning: true })
    return true
  } catch (e) {
    return false
  }
}

export const updateDefaultLockMetadata = async (data: any) => {
  try {
    await LockMetadata.upsert(data, { returning: true })
    return true
  } catch (error) {
    return false
  }
}

export const generateKeyMetadata = async (
  address: string,
  keyId: string,
  isLockOwner: boolean,
  host: string,
  network: number
) => {
  const onChainKeyMetadata = await fetchChainData(address, keyId, network)
  if (Object.keys(onChainKeyMetadata).length == 0) {
    return {}
  }

  const userMetadata = onChainKeyMetadata.owner
    ? await getMetadata(address, onChainKeyMetadata.owner, isLockOwner)
    : {}

  const keyCentricData = await getKeyCentricData(address, keyId)
  const baseTokenData = await getBaseTokenData(address, host, keyId)
  return Object.assign(
    baseTokenData,
    keyCentricData,
    onChainKeyMetadata,
    userMetadata
  )
}

export const getBaseTokenData = async (
  address: string,
  host: string,
  keyId: string
) => {
  const defaultResponse = defaultMappings(address, host, keyId)
  const persistedBasedMetadata = await LockMetadata.findOne({
    where: { address },
  })

  const assetLocation = Asset.tokenMetadataDefaultImage({
    base: baseURIFragement,
    address,
  })

  const result = persistedBasedMetadata
    ? persistedBasedMetadata.data
    : defaultResponse

  if (await Asset.exists(assetLocation)) {
    ;(result as { image: string }).image = assetLocation
  }

  return result
}

export const getKeyCentricData = async (
  address: string,
  tokenId: string
): Promise<any> => {
  const keyCentricData: any = await KeyMetadata.findOne({
    where: {
      address,
      id: tokenId,
    },
  })

  const assetLocation = Asset.tokenCentricImage({
    base: baseURIFragement,
    address,
    tokenId,
  })

  const result = keyCentricData ? keyCentricData.data : {}

  if (await Asset.exists(assetLocation)) {
    result.image = assetLocation
  }

  return result
}

const fetchChainData = async (
  address: string,
  keyId: string,
  network: number
): Promise<any> => {
  const kd = new KeyData()
  const data = await kd.get(address, keyId, network)
  return {
    ...kd.openSeaPresentation(data),
    ...data,
  }
}

const defaultMappings = (address: string, host: string, keyId: string) => {
  const defaultResponse = {
    name: 'Unlock Key',
    description: 'A Key to an Unlock lock.',
    image: `${host}/lock/${address}/icon?id=${keyId}`,
  }

  // Custom mappings
  // TODO: move that to a datastore at some point...
  Metadata.forEach((lockMetadata) => {
    if (address.toLowerCase() == lockMetadata.address.toLowerCase()) {
      defaultResponse.name = lockMetadata.name
      defaultResponse.description = lockMetadata.description
      defaultResponse.image = lockMetadata.image || defaultResponse.image
    }
  })

  // Append description
  defaultResponse.description = `${defaultResponse.description} Unlock is a protocol for memberships. https://unlock-protocol.com/`
  return defaultResponse
}
