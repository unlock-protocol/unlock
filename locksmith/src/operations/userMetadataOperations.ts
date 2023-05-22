import * as Normalizer from '../utils/normalizer'
import { UserTokenMetadataInput } from '../types'
import { UserTokenMetadata } from '../models'

import { InferAttributes } from 'sequelize'
import { isEmpty, merge } from 'lodash'

// @deprecated Use `createOrUpdateUserMetadata` instead.
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

export function isMetadataEmpty(data: Record<string, any>) {
  const publicData = isEmpty(data?.public)
  const protectedData = isEmpty(data?.protected)
  return publicData && protectedData
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

export async function getUserEmailRecipient({
  lockAddress,
  ownerAddress,
}: {
  lockAddress: string
  ownerAddress: string
}): Promise<string | undefined> {
  const ownerMetadata = await getMetadata(
    lockAddress,
    ownerAddress,
    true // include protected
  )

  const protectedData = Normalizer.toLowerCaseKeys({
    ...ownerMetadata?.userMetadata?.protected,
  })

  return protectedData?.email as string
}

export interface UserMetadataInputs {
  by?: string | null
  userAddress: string
  network: number
  lockAddress: string
  metadata: Record<string, any>
}

export const upsertUserMetadata = async (
  {
    userAddress: recipient,
    lockAddress,
    network: chain,
    by,
    metadata,
  }: UserMetadataInputs,
  forceUpdate = false
) => {
  const userAddress = Normalizer.ethereumAddress(recipient)
  const tokenAddress = Normalizer.ethereumAddress(lockAddress)
  const updatedBy = Normalizer.ethereumAddress(by || recipient)
  const data = {
    userMetadata: {
      protected: Normalizer.toLowerCaseKeys(metadata.protected || {}),
      public: Normalizer.toLowerCaseKeys(metadata.public || {}),
    },
  }
  const user = await UserTokenMetadata.findOne({
    where: {
      chain,
      userAddress,
      tokenAddress,
    },
  })

  const existingUserMetadata = Normalizer.toLowerCaseKeys(
    user?.data?.userMetadata || {}
  )

  const userTokenMetadata = {
    chain,
    userAddress,
    tokenAddress,
    // merge existing metadata with new metadata
    data: merge(
      {
        userMetadata: existingUserMetadata,
      },
      data
    ),
    updatedBy,
  }

  // if no UserTokenMetadata, create one
  if (!user) {
    const result = await UserTokenMetadata.create(userTokenMetadata)
    return result
  }

  const canItBeUpdated =
    user.updatedBy === updatedBy ||
    user.userAddress === updatedBy ||
    isMetadataEmpty(user.data?.userMetadata) ||
    forceUpdate

  if (!canItBeUpdated) {
    throw new Error('No permission to update this user metadata')
  }

  const result = await user.update(userTokenMetadata)
  return result
}

export const upsertUsersMetadata = async (users: UserMetadataInputs[]) => {
  const updated: InferAttributes<UserTokenMetadata>[] = []
  const error: string[] = []
  for await (const user of users) {
    try {
      const result = await upsertUserMetadata(user)
      updated.push(result.toJSON())
    } catch (e) {
      error.push(user.userAddress)
    }
  }
  return { updated, error }
}
