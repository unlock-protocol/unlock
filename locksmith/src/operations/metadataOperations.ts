import { KeyMetadata } from '../models/keyMetadata'
import { LockMetadata } from '../models/lockMetadata'
import KeyData from '../utils/keyData'
import { getMetadata } from './userMetadataOperations'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { Verifier } from '../models/verifier'
import Normalizer from '../utils/normalizer'
import * as lockOperations from './lockOperations'
import { Attribute } from '../types'
import metadata from '../config/metadata'
import { getDefaultLockData } from '../utils/metadata'
import { EventData } from '../models'
import { Op } from 'sequelize'
import normalizer from '../utils/normalizer'
interface IsKeyOrLockOwnerOptions {
  userAddress?: string
  lockAddress: string
  keyId: string
  network: number
}

export const updateKeyMetadata = async (data: any) => {
  try {
    await KeyMetadata.upsert(data, {
      returning: true,
      conflictFields: ['id', 'address'],
    })
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

  const [keyCentricData, baseTokenData, userMetadata] = await Promise.all([
    getKeyCentricData(address, keyId),
    getBaseTokenData(address, host, keyId, network),
    onChainKeyMetadata.owner
      ? await getMetadata(address, onChainKeyMetadata.owner, includeProtected)
      : {},
  ])

  const attributes: Attribute[] = []

  // Check if key attributes exists. If it does, we don't want to include the base token data.
  const keyAttributesExist = keyCentricData?.attributes?.length > 0

  if (Array.isArray(onChainKeyMetadata?.attributes)) {
    attributes.push(...onChainKeyMetadata.attributes)
  }

  if (Array.isArray(baseTokenData?.attributes) && !keyAttributesExist) {
    attributes.push(...baseTokenData.attributes)
  }

  if (Array.isArray(keyCentricData?.attributes)) {
    attributes.push(...keyCentricData.attributes)
  }

  const data = {
    ...(keyAttributesExist ? {} : baseTokenData),
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
  keyId: string,
  network: number = 1
) => {
  const defaultResponse = defaultMappings(address, host, keyId)
  const event = await EventData.findOne({
    where: {
      locks: {
        [Op.contains]: [`${normalizer.ethereumAddress(address)}-${network}`],
      },
    },
  })

  const persistedBasedMetadata = await LockMetadata.findOne({
    where: { address },
  })

  const result: Record<string, unknown> = {
    ...defaultResponse,
    ...(event?.data || persistedBasedMetadata?.data || {}),
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

  const result: Record<string, any> = keyCentricData ? keyCentricData.data : {}

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
    if (
      Normalizer.ethereumAddress(address) ==
      Normalizer.ethereumAddress(lockMetadata.address)
    ) {
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

export const getLockMetadata = async ({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) => {
  const event = await EventData.findOne({
    where: {
      locks: {
        [Op.contains]: [
          `${normalizer.ethereumAddress(lockAddress)}-${network}`,
        ],
      },
    },
  })

  if (event) {
    return event?.data
  }

  const lockData = await LockMetadata.findOne({
    where: {
      chain: network,
      address: lockAddress,
    },
  })

  if (!lockData) {
    const defaultLockData = await getDefaultLockData({
      lockAddress,
      network,
    })
    return defaultLockData
  }

  return lockData?.data
}
