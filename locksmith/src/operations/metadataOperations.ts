import { KeyMetadata } from '../models/keyMetadata'
import { LockMetadata } from '../models/lockMetadata'
import KeyData from '../utils/keyData'
import { getMetadata } from './userMetadataOperations'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { Verifier } from '../models/verifier'
import Normalizer from '../utils/normalizer'
import * as lockOperations from './lockOperations'
import * as Asset from '../utils/assets'
import { Attribute } from '../types'
import metadata from '../../config/metadata'
const baseURIFragement = 'https://assets.unlock-protocol.com'
interface IsKeyOrLockOwnerOptions {
  userAddress?: string
  lockAddress: string
  keyId: string
  network: number
}

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
  includeProtected: boolean,
  host: string,
  network: number
) => {
  const onChainKeyMetadata = await fetchChainData(address, keyId, network)
  if (Object.keys(onChainKeyMetadata).length == 0) {
    return {}
  }

  const userMetadata = onChainKeyMetadata.owner
    ? await getMetadata(address, onChainKeyMetadata.owner, includeProtected)
    : {}

  const keyCentricData = await getKeyCentricData(address, keyId)
  const baseTokenData = await getBaseTokenData(address, host, keyId)

  const attributes: Attribute[] = []

  if (Array.isArray(onChainKeyMetadata?.attributes)) {
    attributes.push(...onChainKeyMetadata.attributes)
  }

  if (Array.isArray(baseTokenData?.attributes)) {
    attributes.push(...baseTokenData.attributes)
  }

  if (Array.isArray(keyCentricData?.attributes)) {
    attributes.push(...keyCentricData.attributes)
  }

  const data = {
    ...baseTokenData,
    ...keyCentricData,
    ...onChainKeyMetadata,
    ...userMetadata,
    attributes,
    keyId,
    lockAddress: address,
    network,
  }

  return data
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

  const result: Record<string, any> = {
    ...defaultResponse,
    ...(persistedBasedMetadata?.data || {}),
  }

  return result
}

export const getKeyCentricData = async (address: string, tokenId: string) => {
  const keyCentricData = await KeyMetadata.findOne({
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

  const result: Record<string, any> = keyCentricData ? keyCentricData.data : {}

  if (await Asset.exists(assetLocation)) {
    result.image = assetLocation
  }

  return result
}

const fetchChainData = async (
  address: string,
  keyId: string,
  network: number
) => {
  const keyData = new KeyData()
  const data = await keyData.get(address, keyId, network)
  const { attributes } = keyData.openSeaPresentation(data)
  return {
    ...data,
    attributes,
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
  metadata.forEach((lockMetadata) => {
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

export const isKeyOwnerOrLockVerifier = async ({
  userAddress,
  lockAddress,
  keyId,
  network,
}: IsKeyOrLockOwnerOptions) => {
  if (!userAddress) {
    return false
  }
  const web3Service = new Web3Service(networks)
  const loggedUserAddress = Normalizer.ethereumAddress(userAddress)

  const isVerifier = await Verifier.findOne({
    where: {
      lockAddress,
      address: userAddress,
      network,
    },
  })

  const keyOwner = await web3Service.ownerOf(lockAddress, keyId, network)
  const isLockManager = await web3Service.isLockManager(
    lockAddress,
    userAddress,
    network
  )

  const keyOwnerAddress = Normalizer.ethereumAddress(keyOwner)

  const isKeyOwner = keyOwnerAddress === loggedUserAddress

  return isVerifier?.id || isKeyOwner || isLockManager
}

export const getKeysMetadata = async ({
  keys,
  lockAddress,
  network,
}: {
  keys: any[]
  lockAddress: string
  network: number
}) => {
  const owners: { owner: string; tokenId: string }[] = keys?.map(
    ({ owner, tokenId }: any) => {
      return {
        owner,
        tokenId,
      }
    }
  )

  const mergedDataList = owners.map(async ({ owner, tokenId }) => {
    let metadata: Record<string, any> = {
      owner,
      tokenId,
    }
    const keyData = await getKeyCentricData(lockAddress, tokenId)
    const [keyMetadata] = await lockOperations.getKeyHolderMetadata(
      lockAddress,
      [owner],
      network
    )

    const keyMetadataData = keyMetadata?.data || undefined

    const hasMetadata =
      [...Object.keys(keyData ?? {}), ...Object.keys(keyMetadataData ?? {})]
        .length > 0

    // build metadata object only if metadata or extraMetadata are present
    if (hasMetadata) {
      metadata = {
        ...metadata,
        userAddress: owner,
        data: {
          ...keyMetadataData,
          extraMetadata: {
            ...keyData?.metadata,
          },
        },
      }
    }
    return metadata
  })

  const mergedData = await Promise.all(mergedDataList)
  return mergedData.filter(Boolean)
}
