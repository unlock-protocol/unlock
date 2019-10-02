import * as Normalizer from '../utils/normalizer'

const models = require('../models')

const { UserTokenMetadata } = models

interface UserTokenMetadataInput {
  tokenAddress: string
  userAddress: string
  data: any
}

export default async function addMetadata(metadata: UserTokenMetadataInput) {
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
