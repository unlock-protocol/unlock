import { RequestHandler } from 'express'
import Normalizer from '../normalizer'
import { getWeb3Service } from '../../initializers'
import { graphService } from '../../config/subgraph'

// check if the endpoint caller is the lock manager or the payer of the transaction
export const lockManagerOrPayerMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const hash = req.params.hash
  const userAddress = Normalizer.ethereumAddress(req.user!.walletAddress!)

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
    userAddress,
    network
  )

  // get receipt from subgraph
  const receipt = await graphService.receipt(
    {
      where: {
        id: hash,
      },
    },
    {
      network,
    }
  )

  const isPayer =
    receipt?.payer?.toLocaleLowerCase() === userAddress?.toLocaleLowerCase()

  const isRecipient =
    receipt?.recipient?.toLocaleLowerCase() === userAddress?.toLocaleLowerCase()

  if (!isLockManager && !isPayer && !isRecipient) {
    res.status(403).send({
      message: `${userAddress} is not a lock manager or payer of this transaction`,
    })
    return
  }

  return next()
}
