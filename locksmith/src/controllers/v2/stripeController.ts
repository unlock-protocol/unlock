import stripeOperations from '../../operations/stripeOperations'
import * as Normalizer from '../../utils/normalizer'
import { Request, Response } from 'express'
import logger from '../../logger'

export const connectStripe = async (req: Request, res: Response) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)
  const userAddress = req.user!.walletAddress
  const baseUrl = Normalizer.getURL(req.body.baseUrl)?.toString()
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
      baseUrl
    )
    return res.json({
      url: connected.url,
      created: connected.created,
      object: connected.object,
      expiresAt: connected.expires_at,
    })
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
