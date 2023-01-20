import { RequestHandler } from 'express'
import Dispatcher from '../fulfillment/dispatcher'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import normalizer from '../utils/normalizer'
import { UserTokenMetadata } from '../models'
import { sendEmail } from '../operations/wedlocksOperations'

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
    return response.status(404).send({
      message: 'No key found for this lock and keyId',
    })
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
  const email = Object.entries(userData || {}).find(([key]) => {
    return ['email', 'emailaddress', 'email_address', 'email-address'].includes(
      key.toLowerCase()
    )
  })?.[1] as string

  if (!email) {
    return response.status(404).send({
      message: 'No email address found for this user',
    })
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

  await sendEmail('transferCode', 'transferCode', email, {
    lockName: key.lock.name || 'Unlock Lock',
    network: network.toString(),
    transferCode: part1,
    keyId,
    validPeriod: '15 minutes',
  })

  const responseBody = {
    ...transfer,
    transferCode: part2,
  }

  return response.status(200).send(responseBody)
}
