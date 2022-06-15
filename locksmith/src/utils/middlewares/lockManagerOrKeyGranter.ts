import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from '../normalizer'

export const lockManagerOrKeyGranterMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const userAddress = Normalizer.ethereumAddress(req.user!.walletAddress!)

  if (!lockAddress) {
    return res.status(404).send({
      message: 'Missing lock Address',
    })
  }

  if (!network) {
    return res.status(404).send({
      message: 'Missing network',
    })
  }

  const web3Service = new Web3Service(networks)

  const isLockManager = await web3Service.isLockManager(
    lockAddress,
    userAddress,
    network
  )

  const isKeyGranter = await web3Service.isKeyGranter(
    lockAddress,
    userAddress,
    network
  )

  if (!isLockManager && !isKeyGranter) {
    return res.status(401).send({
      message: `${userAddress} is not a lock manager or key granter for ${lockAddress} on ${network}`,
    })
  }
  return next()
}
