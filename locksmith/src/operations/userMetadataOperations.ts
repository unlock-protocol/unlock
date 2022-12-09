import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadataInput } from '../types' // eslint-disable-line no-unused-vars
import { UserTokenMetadata } from '../models/userTokenMetadata'

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
