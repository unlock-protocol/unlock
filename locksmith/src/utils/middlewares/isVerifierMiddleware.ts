import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { RequestHandler } from 'express-serve-static-core'
import Normalizer from '../normalizer'
import { Verifier } from '../../models/verifier'
import { logger } from '@sentry/utils'

export const isVerifierMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const network = Number(req.params.network)
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    const address = Normalizer.ethereumAddress(req.user!.walletAddress!)

    let isLockManager = false

    const isVerifier = await Verifier.findOne({
      where: {
        lockAddress,
        address,
        network,
      },
    })

    if (!isVerifier) {
      const web3Service = new Web3Service(networks)
      isLockManager = await web3Service.isLockManager(
        lockAddress,
        address,
        network
      )
    }
    const isVerifierOrManager = isVerifier?.id !== undefined || isLockManager

    if (isVerifierOrManager) {
      return next()
    } else {
      return res.status(401).send({
        message: `${address} is not a verifier of from ${lockAddress} on ${network}`,
      })
    }
  } catch (err) {
    logger.error(err)
    return res.status(500).send({
      message: 'There is some unexpected issue, please try again',
    })
  }
}
