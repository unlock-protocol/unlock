import { RequestHandler } from 'express'
import Dispatcher from '../../fulfillment/dispatcher'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import normalizer from '../../utils/normalizer'
import { UserTokenMetadata } from '../../models'
import { sendEmail } from '../../operations/wedlocksOperations'
import { z } from 'zod'

export const createTransferCode: RequestHandler = async (request, response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const keyId = request.params.keyId
  const dispatcher = new Dispatcher()
  const subgraph = new SubgraphService()
  const key = await subgraph.key(
    {
      where: {
        tokenId: keyId.toLowerCase(),
        lock: lockAddress.toLowerCase(),
      },
    },
    {
      network,
    }
  )

  if (!key) {
    response.status(404).send({
      message: 'No key found for this lock and keyId',
    })
    return
  }

  const owner = normalizer.ethereumAddress(key.owner)

  const user = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: lockAddress,
      chain: network,
      userAddress: owner,
    },
  })

  const userData = user?.data?.userMetadata?.protected
  const recipient = Object.entries(userData || {}).find(([key]) => {
    return ['email', 'emailaddress', 'email_address', 'email-address'].includes(
      key.toLowerCase()
    )
  })?.[1] as string

  if (!recipient) {
    response.status(404).send({
      message: 'No email address found for this user',
    })
    return
  }

  const validPeriod = 60 * 60 * 15 // 15 minutes
  const deadline = Math.floor(Date.now() / 1000) + validPeriod

  const transfer = {
    owner,
    lock: lockAddress,
    token: keyId,
    deadline: deadline,
  }

  const transferSignature = await dispatcher.createTransferCode(
    network,
    transfer
  )

  const transferCode = Buffer.from(transferSignature.slice(2), 'hex').toString(
    'base64'
  )

  const [part1, part2] = [transferCode.slice(0, 12), transferCode.slice(12)]

  await sendEmail({
    network,
    template: 'transferCode',
    failoverTemplate: 'transferCode',
    recipient,
    params: {
      lockAddress: key.lock.address,
      lockName: key.lock.name || 'Unlock Lock',
      network: network.toString(),
      transferCode: part1,
      keyId,
      validPeriod: '15 minutes',
    },
    attachments: [],
  })

  const responseBody = {
    ...transfer,
    transferCode: part2,
  }

  response.status(200).send(responseBody)
  return
}

const TransferDoneBody = z.object({
  transferSignature: z.string(),
  deadline: z.number(),
  token: z.string(),
  lock: z.string().transform((item) => normalizer.ethereumAddress(item)),
  network: z.number(),
  owner: z.string().transform((item) => normalizer.ethereumAddress(item)),
})

export const transferDone: RequestHandler = async (request, response) => {
  const userAddress = request.user!.walletAddress
  const { transferSignature, deadline, owner, lock, token, network } =
    await TransferDoneBody.parseAsync(request.body)
  const dispatch = new Dispatcher()

  const isTransferSignedByLocksmith = dispatch.isTransferSignedByLocksmith(
    network,
    {
      owner,
      deadline,
      lock,
      transferSignature,
      token,
    }
  )

  if (!isTransferSignedByLocksmith) {
    response.status(403).send({
      message: 'Transfer signature is not valid',
    })
    return
  }

  const keyOwnerMetadata = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: lock,
      chain: network,
      userAddress: owner,
    },
  })

  await UserTokenMetadata.upsert(
    {
      tokenAddress: lock,
      chain: network,
      userAddress: userAddress,
      data: keyOwnerMetadata?.data || {},
    },
    {
      conflictFields: ['userAddress', 'tokenAddress'],
    }
  )

  response.status(200).send({
    message: 'Transfer done',
  })
  return
}
