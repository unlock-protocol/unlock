import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from '../normalizer'

export const keyOwnerMiddleware: RequestHandler = async (req, res, next) => {
  const network = Number(req.params.network)
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const tokenId = req.params.tokenId
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

  if (!tokenId) {
    return res.status(404).send({
      message: 'Missing tokenId',
    })
  }

  const web3Service = new Web3Service(networks)
  const tokenOwner = await web3Service.ownerOf(lockAddress, tokenId, network)

  if (tokenOwner !== userAddress) {
    return res.status(401).send({
      message: `${userAddress} is not a the owner of ${tokenId} from ${lockAddress} on ${network}`,
    })
  }
  return next()
}
