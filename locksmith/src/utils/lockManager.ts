import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from './normalizer'

const web3Service = new Web3Service(networks)
export const lockManagerMiddleware: RequestHandler = async (req, res, next) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const lockManager = Normalizer.ethereumAddress(req.user!.walletAddress!)

  if (!lockAddress) {
    res.status(404).send({
      message: 'Missing lock Address',
    })
  }

  if (!network) {
    res.status(404).send({
      message: 'Missing network',
    })
  }

  const isLockManager = await web3Service.isLockManager(
    lockAddress,
    lockManager,
    network
  )

  if (!isLockManager) {
    return res.status(401).send({
      message: `${lockManager} is not a lock manager for ${lockAddress} on ${network}`,
    })
  }
  return next()
}
