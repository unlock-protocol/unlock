import { KeyMetadata } from '../models/keyMetadata'
import { LockMetadata } from '../models/lockMetadata'
import Metadata from '../../config/metadata'
import KeyData from '../utils/keyData'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]
const Asset = require('../utils/assets')

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
  } catch (e) {
    return false
  }
}

export const generateKeyMetadata = async (address: string, keyId: string) => {
  let onChainKeyMetadata = await fetchChainData(address, keyId)
  if (Object.keys(onChainKeyMetadata).length == 0) {
    return {}
  }
  let keyCentricData = await getKeyCentricData(address, keyId)
  let baseTokenData = await getBaseTokenData(address)
  return Object.assign(baseTokenData, keyCentricData, onChainKeyMetadata)
}

const getBaseTokenData = async (address: string) => {
  let defaultResponse = defaultMappings(address)
  let persistedBasedMetadata = await LockMetadata.findOne({
    where: { address: address },
  })

  let assetLocation = Asset.tokenMetadataDefaultImage({
    base: 'https://assets.unlock-protocol.com',
    address: address,
  })

  let result = persistedBasedMetadata
    ? persistedBasedMetadata.data
    : defaultResponse

  if (await Asset.exists(assetLocation)) {
    ;(result as { image: string }).image = assetLocation
  }

  return result
}

const getKeyCentricData = async (address: string, tokenId: string) => {
  let keyCentricData: any = await KeyMetadata.findOne({
    where: {
      address: address,
      id: tokenId,
    },
  })

  let assetLocation = Asset.tokenCentricImage({
    base: 'https://assets.unlock-protocol.com',
    address: address,
    tokenId: tokenId,
  })

  let result = keyCentricData ? keyCentricData.data : {}

  if (await Asset.exists(assetLocation)) {
    result.image = assetLocation
  }

  return result
}

const fetchChainData = async (address: string, keyId: string) => {
  let kd = new KeyData(config.web3ProviderHost)
  let data = await kd.get(address, keyId)
  return kd.openSeaPresentation(data)
}

const defaultMappings = (address: string) => {
  let defaultResponse = {
    name: 'Unlock Key',
    description: 'A Key to an Unlock lock.',
    image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
  }

  // Custom mappings
  // TODO: move that to a datastore at some point...
  Metadata.forEach(lockMetadata => {
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
