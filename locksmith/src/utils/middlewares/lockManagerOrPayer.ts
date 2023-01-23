import { RequestHandler } from 'express'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import Normalizer from '../normalizer'
import { SubgraphService } from '@unlock-protocol/unlock-js'

// check if the endpoint caller is the lock manager or the payer of the transaction
export const lockManagerOrPayerMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const hash = Number(req.params.hash)
  const userAddress = Normalizer.ethereumAddress(req.user!.walletAddress!)

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
    userAddress,
    network
  )

  const subgraph = new SubgraphService(networks)

  // get receipt
  const receipt = await subgraph.receipt(
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

  if (!isLockManager && !isPayer) {
    return res.status(401).send({
      message: `${userAddress} is not a lock manager or payer of this transaction`,
    })
  }
  return next()
}
