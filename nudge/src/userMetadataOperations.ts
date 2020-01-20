import * as Normalizer from './utils/normalizer'

import models = require('./models')

const { UserTokenMetadata } = models

export async function getMetadata(tokenAddress: string, userAddress: string) {
  const data = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: Normalizer.ethereumAddress(tokenAddress),
      userAddress: Normalizer.ethereumAddress(userAddress),
    },
  })

  return data ? data.data : data
}
