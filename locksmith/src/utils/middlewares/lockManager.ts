import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from './../normalizer'
import logger from '../../logger'

export const lockManagerMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    const network = Number(req.params.network)
    const lockManager = Normalizer.ethereumAddress(req.user!.walletAddress!)

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
      lockManager,
      network
    )

    if (!isLockManager) {
      return res.status(403).send({
        message: `${lockManager} is not a lock manager for ${lockAddress} on ${network}`,
      })
    }
  } catch (err) {
    logger.error(err.message)
    return res.status(422).send({
      message: `There is some problem, please try again.`,
    })
  }
  return next()
}
