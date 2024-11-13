import { RequestHandler } from 'express'
import Normalizer from '../normalizer'
import { getWeb3Service } from '../../initializers'

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

  const [isLockManager, keyOwner] = await Promise.all([
    web3Service.isLockManager(lockAddress, userAddress, network),
    web3Service.ownerOf(lockAddress, tokenId, network),
  ])

  if (!isLockManager && Normalizer.ethereumAddress(keyOwner) !== userAddress) {
    res.status(403).send({
      message: `${userAddress} is not a lock manager or the key owner of ${tokenId} for ${lockAddress} on ${network}`,
    })
    return
  }
  return next()
}
