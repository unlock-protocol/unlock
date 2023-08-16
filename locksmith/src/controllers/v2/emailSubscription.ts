import { RequestHandler } from 'express'
import normalizer from '../../utils/normalizer'
import { UnsubscribeList } from '../../models/UnsubscribeList'

export const unsubscribeFromEmailList: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const userAddress = request.user!.walletAddress

  if (!(lockAddress && network && userAddress)) {
    response.status(400).send({
      message: 'Missing required parameters',
    })
    return
  }

  await UnsubscribeList.upsert(
    {
      lockAddress,
      userAddress,
      network,
    },
    {
      conflictFields: ['lockAddress', 'userAddress', 'network'],
    }
  )
  return response.send({
    success: true,
  })
}

export const subscribeToEmailList: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const userAddress = request.user!.walletAddress

  if (!(lockAddress && network && userAddress)) {
    response.status(400).send({
      message: 'Missing required parameters',
    })
    return
  }

  await UnsubscribeList.destroy({
    where: {
      lockAddress,
      userAddress,
      network,
    },
  })

  return response.send({
    success: true,
  })
}
