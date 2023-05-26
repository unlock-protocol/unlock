import stripeOperations from '../operations/stripeOperations'
import { evaluateLockOwnership } from './metadataController'
import * as Normalizer from '../utils/normalizer'
import { LockIcons } from '../models'
import { Request, RequestHandler, Response } from 'express'
import logger from '../logger'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { getGeneratedLockIcon, getLockIcon } from '../operations/lockOperations'

export const connectStripe = async (req: Request, res: Response) => {
  const { message } = JSON.parse(decodeURIComponent(req.query.data!.toString()))
  // A previous middleware will have evaluated everything and assign a signee
  const { lockAddress, chain, baseUrl } = message['Connect Stripe']
  try {
    const isAuthorized = await evaluateLockOwnership(
      lockAddress,
      req.signee,
      parseInt(chain)
    )
    if (!isAuthorized) {
      return res
        .status(401)
        .send(
          `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
        )
    } else {
      const links = await stripeOperations.connectStripe(
        Normalizer.ethereumAddress(req.signee),
        Normalizer.ethereumAddress(lockAddress),
        chain,
        baseUrl
      )
      return res.json(links)
    }
  } catch (error) {
    logger.error(
      `Failed to connect Stripe: there was an error ${lockAddress}, ${chain}`,
      error
    )
    return res.status(401).send(`Cannot connect stripe: ${error.message}`)
  }
}

export const stripeConnected = async (req: Request, res: Response) => {
  try {
    const { stripeEnabled, stripeAccount: account } =
      await stripeOperations.getStripeConnectForLock(
        Normalizer.ethereumAddress(req.params.lockAddress),
        req.chain
      )

    if (stripeEnabled) {
      return res.json({ connected: 1, account })
    }

    return res.json({
      connected: account ? 0 : -1, // status is '0' when account is connected but not ready
      account,
    })
  } catch (error) {
    logger.error(
      'Cannot verified if Stripe is connected: there was an error',
      error
    )
    return res.status(500).send(error)
  }
}

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
export const lockIcon = async (req: Request, res: Response) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const { original } = req.query
  const lockIcon = await getLockIcon({
    lockAddress,
    original: original === '1',
    requestUrl: Normalizer.getRequestURL(req).toString(),
  })

  if (lockIcon.isURL) {
    return res.redirect(lockIcon.icon)
  } else {
    res.setHeader('Content-Type', lockIcon.type)
    return res.send(lockIcon.icon)
  }
}

export const getTokenURIImage: RequestHandler<{
  network: string
  lockAddress: string
  keyId?: string
}> = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const keyId = request.params.keyId
  const network = Number(request.params.network)
  try {
    // If we have a keyId, we can try to get the tokenURI from the subgraph
    if (keyId) {
      const subgraph = new SubgraphService()
      const key = await subgraph.key(
        {
          where: {
            tokenId: keyId,
            lock: lockAddress.toLowerCase(),
          },
        },
        {
          network,
        }
      )
      // If we have a tokenURI, we can fetch the image from the metadata
      if (key.tokenURI) {
        const metadata = await fetch(key.tokenURI)
        const json = await metadata.json()
        return response.redirect(json?.image)
      }
    }

    // If we don't have a keyId or a tokenURI, fetch the lock icon
    const lockIcon = await getLockIcon({
      lockAddress,
      requestUrl: Normalizer.getRequestURL(request).toString(),
    })

    if (lockIcon.isURL) {
      return response.redirect(lockIcon.icon)
    } else {
      response.setHeader('Content-Type', lockIcon.type)
      return response.send(lockIcon.icon)
    }
  } catch (error) {
    logger.error(error)
    const svg = getGeneratedLockIcon(lockAddress)
    return response.setHeader('Content-Type', 'image/svg+xml').send(svg)
  }
}

export const changeLockIcon = async (req: Request, res: Response) => {
  const { message, icon } = req.body
  const { lockAddress, chain, lockManager } = message['Update Icon']

  const isAuthorized = await evaluateLockOwnership(
    lockAddress,
    lockManager,
    parseInt(chain)
  )
  if (!isAuthorized) {
    return res
      .status(401)
      .send(
        `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
      )
  } else {
    let lockIcon = await LockIcons.findOne({
      where: {
        chain,
        lock: Normalizer.ethereumAddress(lockAddress),
      },
    })
    if (lockIcon) {
      lockIcon.icon = icon
      await lockIcon.save()
    } else {
      lockIcon = await LockIcons.create({
        chain,
        lock: Normalizer.ethereumAddress(lockAddress),
        icon: icon,
      })
    }
  }

  return res.status(200).send('OK')
}

export const disconnectStripe = async (req: Request, res: Response) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = Number(req.params.network)

  try {
    const loggedUserAddress = Normalizer.ethereumAddress(
      req.user!.walletAddress
    )
    const deleted = await stripeOperations.disconnectStripe({
      lockManager: Normalizer.ethereumAddress(loggedUserAddress),
      lockAddress,
      chain: network,
    })

    if (deleted) {
      res.sendStatus(200)
    } else {
      res.sendStatus(204)
    }
  } catch (err) {
    logger.error('There is some unexpected issue, please try again', err)
    res.status(500).send(err)
  }
}

const lockController = {
  lockIcon,
  getTokenURIImage,
  connectStripe,
  stripeConnected,
  changeLockIcon,
  disconnectStripe,
}

export default lockController
