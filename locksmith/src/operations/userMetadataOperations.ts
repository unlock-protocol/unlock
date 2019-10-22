import * as Normalizer from '../utils/normalizer'

const models = require('../models')

const { UserTokenMetadata } = models

interface UserTokenMetadataInput {
  tokenAddress: string
  userAddress: string
  data: any
}

export async function addMetadata(metadata: UserTokenMetadataInput) {
  return await UserTokenMetadata.upsert(
    {
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
    }
  )
}

export async function getMetadata(
  tokenAddress: string,
  userAddress: string,
  includeProtected = false
) {
  let data = await UserTokenMetadata.findOne({
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
