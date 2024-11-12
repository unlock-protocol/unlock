import { RequestHandler } from 'express'
import Normalizer from './../normalizer'
import logger from '../../logger'
import { getWeb3Service } from '../../initializers'

export const lockManagerMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    const network = Number(req.params.network)
    const lockManager = Normalizer.ethereumAddress(req.user!.walletAddress!)

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
      lockManager,
      network
    )

    if (!isLockManager) {
      res.status(403).send({
        message: `${lockManager} is not a lock manager for ${lockAddress} on ${network}`,
      })
      return
    }
  } catch (err) {
    logger.error(err.message)
    res.status(422).send({
      message: `There is some problem, please try again.`,
    })
    return
  }
  return next()
}
