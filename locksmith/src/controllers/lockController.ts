import stripeOperations from '../operations/stripeOperations'
import { evaluateLockOwnership } from './metadataController'
import * as Normalizer from '../utils/normalizer'
import { LockIcons } from '../models'
import { Request, RequestHandler, Response } from 'express'
import logger from '../logger'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import {
  getGeneratedLockIcon,
  getLockIcon,
  getKeyIcon,
} from '../operations/lockOperations'

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
      res
        .status(401)
        .send(
          `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
        )
      return
    } else {
      const links = await stripeOperations.connectStripe(
        Normalizer.ethereumAddress(req.signee),
        Normalizer.ethereumAddress(lockAddress),
        chain,
        baseUrl
      )
      res.json(links)
      return
    }
  } catch (error) {
    logger.error(
      `Failed to connect Stripe: there was an error ${lockAddress}, ${chain}`,
      error
    )
    res.status(401).send(`Cannot connect stripe: ${error.message}`)
    return
  }
}

export const stripeConnected = async (req: Request, res: Response) => {
  try {
    const {
      stripeEnabled,
      stripeAccount: account,
      countrySpec,
    } = await stripeOperations.getStripeConnectForLock(
      Normalizer.ethereumAddress(req.params.lockAddress),
      req.chain
    )

    if (stripeEnabled) {
      res.json({ connected: 1, account, countrySpec })
      return
    }

    res.json({
      connected: account ? 0 : -1, // status is '0' when account is connected but not ready
      account,
    })
    return
  } catch (error) {
    logger.error(
      'Cannot verified if Stripe is connected: there was an error',
      error
    )
    res.status(500).send(error)
    return
  }
}

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
export const lockIcon = async (req: Request, res: Response) => {
  const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
  const network = parseInt(req.params.network) || 1 // defaults to mainnet
  const { original } = req.query

  let icon = await getLockIcon({
    lockAddress,
    original: original === '1',
    requestUrl: Normalizer.getRequestURL(req).toString(),
  })

  if (req.query.id) {
    // Check if there is a custom icon for this key
    const keyIcon = await getKeyIcon({
      network,
      lockAddress,
      keyId: String(req.query.id || ''),
    })
    if (keyIcon) {
      icon = keyIcon
    }
  }

  if (icon.isURL) {
    res.redirect(icon.icon)
    return
  } else {
    res.setHeader('Content-Type', icon.type!)
    res.send(icon.icon)
    return
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
        response.redirect(json?.image)
        return
      }
    }

    // If we don't have a keyId or a tokenURI, fetch the lock icon
    const lockIcon = await getLockIcon({
      lockAddress,
      requestUrl: Normalizer.getRequestURL(request).toString(),
    })

    if (lockIcon.isURL) {
      response.redirect(lockIcon.icon)
      return
    } else {
      response.setHeader('Content-Type', lockIcon.type!)
      response.send(lockIcon.icon)
      return
    }
  } catch (error) {
    logger.error(error)
    const svg = getGeneratedLockIcon(lockAddress)
    response.setHeader('Content-Type', 'image/svg+xml').send(svg)
    return
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
    res
      .status(401)
      .send(
        `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
      )
    return
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

  res.status(200).send('OK')
  return
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
