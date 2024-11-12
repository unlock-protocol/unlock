import { RequestHandler } from 'express'
import Normalizer from '../normalizer'
import { getWeb3Service } from '../../initializers'

export const lockManagerOrKeyGranterMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const userAddress = Normalizer.ethereumAddress(req.user!.walletAddress!)

  if (!lockAddress) {
    res.status(404).send({
      message: 'Missing lock Address',
    })
    return
  }

  if (!network) {
    res.status(404).send({
      message: 'Missing network',
    })
    return
  }

  const web3Service = getWeb3Service()

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
    res.status(403).send({
      message: `${userAddress} is not a lock manager or key granter for ${lockAddress} on ${network}`,
    })
    return
  }
  return next()
}
