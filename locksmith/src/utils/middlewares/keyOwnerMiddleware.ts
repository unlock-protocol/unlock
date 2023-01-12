import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from '../normalizer'

export const keyOwnerMiddleware: RequestHandler = async (req, res, next) => {
  const network = Number(req.params.network)
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const keyId = req.params.keyId
  const userAddress = Normalizer.ethereumAddress(req.user!.walletAddress!)

  if (!lockAddress) {
    return res.status(404).send({
      message: 'Missing lock address',
    })
  }

  if (!network) {
    return res.status(404).send({
      message: 'Missing network',
    })
  }

  if (!keyId) {
    return res.status(404).send({
      message: 'Missing keyId',
    })
  }

  const web3Service = new Web3Service(networks)
  const tokenOwner = await web3Service.ownerOf(lockAddress, keyId, network)

  if (tokenOwner !== userAddress) {
    return res.status(401).send({
      message: `${userAddress} is not a the owner of ${keyId} from ${lockAddress} on ${network}`,
    })
  }
  return next()
}
