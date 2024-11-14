import { RequestHandler } from 'express'
import Normalizer from '../normalizer'
import { getWeb3Service } from '../../initializers'

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

  const web3Service = getWeb3Service()
  const tokenOwner = await web3Service.ownerOf(lockAddress, keyId, network)

  if (tokenOwner !== userAddress) {
    res.status(403).send({
      message: `${userAddress} is not a the owner of ${keyId} from ${lockAddress} on ${network}`,
    })
    return
  }
  return next()
}
