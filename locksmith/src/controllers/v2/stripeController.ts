import stripeOperations, {
  stripeConnection,
} from '../../operations/stripeOperations'
import * as Normalizer from '../../utils/normalizer'
import { Request, Response } from 'express'
import logger from '../../logger'

export const connectStripe = async (req: Request, res: Response) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const userAddress = req.user!.walletAddress
  const baseUrl = Normalizer.getURL(req.body.baseUrl)?.toString()
  const stripeAccount = req.body.stripeAccount
  if (!baseUrl) {
    res.status(400).send({
      message: `baseUrl is invalid or missing.`,
    })
    return
  }
  try {
    const connected = await stripeOperations.connectStripe(
      userAddress,
      Normalizer.ethereumAddress(lockAddress),
      network,
      baseUrl,
      stripeAccount
    )
    if (connected) {
      res.json({
        url: connected.url,
        created: connected.created,
        object: connected.object,
        expiresAt: connected.expires_at,
      })
      return
    }
    res.json({})
    return
  } catch (error) {
    logger.error(
      `Failed to connect Stripe: there was an error ${lockAddress}, ${network}`,
      error
    )
    res.status(400).send({
      message: `Cannot connect stripe: ${error.message}`,
    })
    return
  }
}

export const getConnectionsForManager = async (req: Request, res: Response) => {
  const userAddress = req.user!.walletAddress
  const connections =
    await stripeOperations.getConnectionsForManager(userAddress)
  if (!connections) {
    res.json({
      result: [],
    })
    return
  }

  const seen: {
    [key: string]: boolean
  } = {}

  // let's filter the ones which indeed connected!
  const activeStripeAccounts = (
    await Promise.all(
      connections.map(async ({ stripeAccount }) => {
        const connection = await stripeConnection(stripeAccount)
        if (connection?.charges_enabled) {
          return connection
        }
        return false
      })
    )
  ).filter((connection) => {
    if (!connection || seen[connection.id]) return false
    seen[connection.id] = true
    return connection
  })

  res.json({
    result: activeStripeAccounts,
  })
  return
}
