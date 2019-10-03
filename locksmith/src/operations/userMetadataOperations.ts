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
        userMetadata: metadata.data,
      },
    },
    {
      fields: ['data'],
      returning: true,
    }
  )
}

export async function getMetadata(tokenAddress: string, userAddress: string) {
  let data = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: Normalizer.ethereumAddress(tokenAddress),
      userAddress: Normalizer.ethereumAddress(userAddress),
    },
  })

  return data ? data.data : data
}
