import { KeyMetadata } from '../models/keyMetadata'
import { LockMetadata } from '../models/lockMetadata'
import Metadata from '../../config/metadata'
import KeyData from '../utils/keyData'
import { getMetadata } from './userMetadataOperations'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { Verifier } from '../models/verifier'
import Normalizer from '../utils/normalizer'
import * as lockOperations from './lockOperations'

const Asset = require('../utils/assets')

const baseURIFragement = 'https://assets.unlock-protocol.com'

interface IsKeyOrLockOwnerOptions {
  userAddress?: string
  lockAddress: string
  keyId: string
  network: number
}

interface Lock {
  keys: {
    owner: {
      address: string
    }
    keyId: string
    expiration: string
  }[]
  address: string
  name: string
  owner: string
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
  return Object.assign(
    baseTokenData,
    keyCentricData,
    onChainKeyMetadata,
    userMetadata,
    {
      keyId,
      lockAddress: address,
      network,
    }
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
  const owners: { owner: string; keyId: string }[] = keys?.map(
    ({ owner, keyId }: any) => {
      return {
        owner: owner?.address,
        keyId,
      }
    }
  )

  const mergedDataList = owners.map(async ({ owner, keyId }) => {
    let metadata: any = undefined
    const keyData = await getKeyCentricData(lockAddress, keyId)
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

/** merge keys items with the corresponding metadata value */
export const buildMembersWithMetadata = (lock: Lock, metadataItems: any[]) => {
  return lock?.keys?.map((key: any) => {
    // get key metadata for the owner
    const { userMetadata, extraMetadata } =
      metadataItems?.find(
        (metadata) =>
          metadata?.userAddress?.toLowerCase() ===
          key?.owner?.address?.toLowerCase()
      )?.data ?? {}

    return {
      token: key?.keyId,
      lockName: lock?.name,
      expiration: key?.expiration,
      keyholderAddress: lock?.owner,
      lockAddress: lock?.address,
      ...userMetadata?.private,
      ...userMetadata?.protected,
      ...extraMetadata,
    }
  })
}
