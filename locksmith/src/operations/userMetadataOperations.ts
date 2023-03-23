import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadataInput } from '../types'
import { UserTokenMetadata } from '../models'
import { isEmpty } from 'lodash'

export function isMetadataEmpty(data: Record<string, any>) {
  const publicData = isEmpty(data?.public)
  const protectedData = isEmpty(data?.protected)
  return publicData && protectedData
}

// TODO: Are we still using this?
// We should and we should add he logic of overriding data by merging
export async function addMetadata(metadata: UserTokenMetadataInput) {
  return await UserTokenMetadata.upsert(
    {
      chain: metadata.chain,
      tokenAddress: Normalizer.ethereumAddress(metadata.tokenAddress),
      userAddress: Normalizer.ethereumAddress(metadata.userAddress),
      data: {
        userMetadata: {
          protected: metadata.data.protected,
          public: metadata.data.public,
        },
      },
    },
    {
      fields: ['data'],
      returning: true,
      conflictFields: ['tokenAddress', 'userAddress'],
    }
  )
}

export async function getMetadata(
  tokenAddress: string,
  userAddress: string,
  includeProtected = false
) {
  const data = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: Normalizer.ethereumAddress(tokenAddress),
      userAddress: Normalizer.ethereumAddress(userAddress),
    },
  })

  if (data && !includeProtected) {
    delete data.data.userMetadata.protected
  }

  return data ? data.data : data
}
