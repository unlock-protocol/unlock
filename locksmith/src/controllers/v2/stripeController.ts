import stripeOperations, {
  stripeConnectionReady,
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
    return res.status(400).send({
      message: `baseUrl is invalid or missing.`,
    })
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
      return res.json({
        url: connected.url,
        created: connected.created,
        object: connected.object,
        expiresAt: connected.expires_at,
      })
    }
    return res.json({})
  } catch (error) {
    logger.error(
      `Failed to connect Stripe: there was an error ${lockAddress}, ${network}`,
      error
    )
    return res.status(400).send({
      message: `Cannot connect stripe: ${error.message}`,
    })
  }
}

export const getConnectionsForManager = async (req: Request, res: Response) => {
  const userAddress = req.user!.walletAddress
  const connections = await stripeOperations.getConnectionsForManager(
    userAddress
  )
  if (!connections) {
    return {
      result: [],
    }
  }

  // let's filter the ones which indeed connected!
  const activeStripeAccounts = (
    await Promise.all(
      connections.map(async (connection) => {
        const ready = await stripeConnectionReady(connection.stripeAccount)
        if (ready) {
          return connection
        }
        return false
      })
    )
  ).filter((connection) => !!connection)

  return res.json({
    result: activeStripeAccounts.map(({ lock, chain, stripeAccount }) => ({
      lock,
      chain,
      stripeAccount,
    })),
  })
}
