import { RequestHandler } from 'express'
import Dispatcher from '../fulfillment/dispatcher'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import normalizer from '../utils/normalizer'
import { UserTokenMetadata } from '../models'
import { sendEmail } from '../operations/wedlocksOperations'
import config from '../config/config'

export const createTransferCode: RequestHandler = async (request, response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const keyId = request.params.keyId
  const dispatcher = new Dispatcher()
  const subgraph = new SubgraphService()

  const user = await UserTokenMetadata.findOne({
    where: {
      tokenAddress: lockAddress,
      chain: network,
    },
  })

  const userData = user?.data?.userMetadata?.protected
  const email = Object.keys(userData || {}).find((key) => {
    return ['email', 'emailaddress', 'email_address', 'email-address'].includes(
      key.toLowerCase()
    )
  })

  if (!email) {
    return response.status(404).send({
      message: 'No email address found for this user',
    })
  }

  const validPeriod = 60 * 60 * 15 // 15 minutes
  const deadline = Math.floor(Date.now() / 1000) + validPeriod

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

  const owner = normalizer.ethereumAddress(key.owner)

  const transfer = {
    owner,
    lock: lockAddress,
    token: keyId,
    deadline: deadline,
  }

  const transferCode = await dispatcher.createTransferCode(network, transfer)

  const transferUrl = new URL(config.unlockApp)
  transferUrl.searchParams.set('lockAddress', lockAddress)
  transferUrl.searchParams.set('keyId', keyId)
  transferUrl.searchParams.set('transferCode', transferCode)
  transferUrl.searchParams.set('network', network.toString())
  transferUrl.searchParams.set('transfer', JSON.stringify(transfer))

  await sendEmail('transferCode', 'transferCode', email, {
    lockName: key.lock.name || 'Unlock Lock',
    network: network.toString(),
    transferCode,
    keyId,
    transferUrl: transferUrl.toString(),
    validPeriod: '15 minutes',
  })

  return response.status(200).send(transfer)
}
