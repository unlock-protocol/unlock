import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from '../normalizer'

export const lockManagerOrKeyOwnerMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const userAddress = req.user!.walletAddress
  const tokenId = req.params.keyId.toLowerCase()

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

  const [isLockManager, keyOwner] = await Promise.all([
    web3Service.isLockManager(lockAddress, userAddress, network),
    web3Service.ownerOf(lockAddress, tokenId, network),
  ])

  if (!isLockManager && Normalizer.ethereumAddress(keyOwner) !== userAddress) {
    return res.status(403).send({
      message: `${userAddress} is not a lock manager or the key owner of ${tokenId} for ${lockAddress} on ${network}`,
    })
  }
  return next()
}
