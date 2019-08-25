import { KeyMetadata } from '../models/keyMetadata'
import { LockMetadata } from '../models/lockMetadata'
import Metadata from '../../config/metadata'
import KeyData from '../utils/keyData'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

export const updateKeyMetadata = async (data: any) => {
  try {
    return !!(await KeyMetadata.upsert(data, { returning: true }))
  } catch (e) {
    return false
  }
}

export const updateDefaultLockMetadata = async (data: any) => {
  try {
    return !!(await LockMetadata.upsert(data, { returning: true }))
  } catch (e) {
    return false
  }
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

export const generateKeyMetadata = async (address: string, keyId: string) => {
  let onChainKeyMetadata = await fetchChainData(address, keyId)
  if (Object.keys(onChainKeyMetadata).length == 0) {
    return {}
  }

  let defaultResponse = defaultMappings(address)
  let persistedBasedMetadata = await LockMetadata.findOne({
    where: { address: address },
  })

  let keyCentricData: any = await KeyMetadata.findOne({
    where: {
      address: address,
      id: keyId,
    },
  })

  let result = keyCentricData ? keyCentricData.data : {}
  let defaults = persistedBasedMetadata
    ? persistedBasedMetadata.data
    : defaultResponse
  return Object.assign(result, defaults, onChainKeyMetadata)
}

const fetchChainData = async (address: string, keyId: string) => {
  let kd = new KeyData(config.web3ProviderHost)
  return await kd.get(address, keyId)
}
