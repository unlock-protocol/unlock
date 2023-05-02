import { Web3Service } from '@unlock-protocol/unlock-js'
import { Response, Request, RequestHandler } from 'express'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import * as metadataOperations from '../../operations/metadataOperations'
import logger from '../../logger'
import { KeyMetadata } from '../../models/keyMetadata'
import { LockMetadata } from '../../models/lockMetadata'
import * as lockOperations from '../../operations/lockOperations'
import {
  upsertUsersMetadata,
  upsertUserMetadata,
  UserMetadataInputs,
} from '../../operations/userMetadataOperations'
import { networks } from '@unlock-protocol/networks'

export const UserMetadata = z
  .object({
    public: z.record(z.string(), z.any()).optional(),
    protected: z.record(z.string(), z.any()).optional(),
  })
  .strict()
  .partial()

const UserMetadataBody = z.object({
  lockAddress: z.string().transform((item) => Normalizer.ethereumAddress(item)),
  userAddress: z.string().transform((item) => Normalizer.ethereumAddress(item)),
  metadata: UserMetadata,
  network: z.number(),
})

const BulkUserMetadataBody = z.object({
  users: z.array(UserMetadataBody),
})

export const getLockMetadata: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const lockData = await metadataOperations.getLockMetadata({
    lockAddress,
    network,
  })
  return response.status(200).send(lockData)
}

export const getKeyMetadata: RequestHandler = async (request, response) => {
  const keyId = request.params.keyId.toLowerCase()
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const host = `${request.protocol}://${request.headers.host}`

  const includeProtected = await metadataOperations.isKeyOwnerOrLockVerifier({
    keyId,
    network,
    lockAddress,
    userAddress: request.user?.walletAddress,
  })

  const keyData = await metadataOperations.generateKeyMetadata(
    lockAddress,
    keyId,
    includeProtected,
    host,
    network
  )

  return response.status(200).send(keyData)
}

export const getBulkKeysMetadata: RequestHandler = async (
  request: Request,
  response: Response
) => {
  try {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const { keys }: any = request.body

    if (!keys) {
      return response
        .send({
          message: 'Parameter `keys` is not present',
        })
        .status(500)
    }

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
      const keyData = await metadataOperations.getKeyCentricData(
        lockAddress,
        keyId
      )
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
    const filtredMergedData = mergedData.filter(Boolean)

    return response.send(filtredMergedData).status(200)
  } catch (err) {
    logger.error(err.message)
    return response.status(400).send({
      message: 'There were some problems from getting keys metadata.',
    })
  }
}

export const updateLockMetadata: RequestHandler = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const { metadata } = request.body
  const [updatedLockMetadata] = await LockMetadata.upsert(
    {
      address: lockAddress,
      chain: network,
      data: {
        ...metadata,
      },
    },
    {
      returning: true,
    }
  )
  return response.status(200).send(updatedLockMetadata.data)
}

export const updateKeyMetadata: RequestHandler = async (request, response) => {
  const keyId = request.params.keyId.toLowerCase()
  const { metadata } = request.body
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const host = `${request.protocol}://${request.headers.host}`

  await KeyMetadata.upsert(
    {
      chain: network,
      address: lockAddress,
      id: keyId,
      data: {
        ...metadata,
      },
    },
    {
      conflictFields: ['address', 'id'],
    }
  )

  const keyData = await metadataOperations.generateKeyMetadata(
    lockAddress,
    keyId,
    true /* isLockManager */,
    host,
    network
  )

  return response.status(200).send(keyData)
}

export const updateUserMetadata: RequestHandler = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const userAddress = Normalizer.ethereumAddress(request.params.userAddress)
  const network = Number(request.params.network)
  const metadata = await UserMetadata.parseAsync(request.body.metadata)
  const web3Service = new Web3Service(networks)
  const loggedInUser = request.user!.walletAddress
  const isLockManager = await web3Service.isLockManager(
    lockAddress,
    loggedInUser,
    network
  )
  const user = await upsertUserMetadata(
    {
      network,
      userAddress,
      lockAddress,
      metadata,
      by: loggedInUser,
    },
    isLockManager
  )

  return response.status(200).send({
    metadata: user.toJSON().data?.userMetadata,
  })
}

export const updateUsersMetadata: RequestHandler = async (
  request: Request,
  response: Response
) => {
  const loggedInUser = request.user!.walletAddress
  const parsed = await BulkUserMetadataBody.parseAsync(request.body)

  const users = parsed.users.map(
    (item) =>
      ({
        ...item,
        by: loggedInUser,
      } as UserMetadataInputs)
  )

  const { updated, error } = await upsertUsersMetadata(users)

  return response.status(200).send({
    result: updated.map((item) => {
      return {
        network: item.chain,
        userAddress: item.userAddress,
        lockAddress: item.tokenAddress,
        metadata: item.data?.userMetadata,
      }
    }),
    error,
  })
}
