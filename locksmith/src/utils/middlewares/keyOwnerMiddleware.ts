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
    res.status(404).send({
      message: 'Missing lock address',
    })
    return
  }

  if (!network) {
    res.status(404).send({
      message: 'Missing network',
    })
    return
  }

  if (!keyId) {
    res.status(404).send({
      message: 'Missing keyId',
    })
    return
  }

  const web3Service = new Web3Service(networks)
  const tokenOwner = await web3Service.ownerOf(lockAddress, keyId, network)

  if (tokenOwner !== userAddress) {
    res.status(403).send({
      message: `${userAddress} is not a the owner of ${keyId} from ${lockAddress} on ${network}`,
    })
    return
  }
  return next()
}
