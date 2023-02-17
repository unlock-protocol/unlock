import parseDataUri from 'parse-data-uri'
import stripeOperations from '../operations/stripeOperations'
import { evaluateLockOwnership } from './metadataController'
import * as Normalizer from '../utils/normalizer'
import { LockIcons, LockMetadata } from '../models'
import { Request, RequestHandler, Response } from 'express'
import logger from '../logger'
import lockIconUtils from '../utils/lockIcon'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import config from '../config/config'

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
    const stripeConnected = await stripeOperations.getStripeConnectForLock(
      Normalizer.ethereumAddress(req.params.lockAddress),
      req.chain
    )

    if (stripeConnected !== -1 && stripeConnected !== 0) {
      return res.json({ connected: 1 })
    }
    return res.json({ connected: stripeConnected })
  } catch (error) {
    logger.error(
      'Cannot verified if Stripe is connected: there was an error',
      error
    )
    return res.status(500).send(error)
  }
}

export const getLockIcon = async ({
  lockAddress,
  original,
}: {
  lockAddress: string
  original?: boolean
}) => {
  const getOriginal = () => {
    const svg = lockIconUtils.lockIcon(lockAddress)
    return {
      icon: svg,
      type: 'image/svg+xml',
      isURL: false,
    }
  }
  if (original) {
    return getOriginal()
  } else {
    const lockIcon = await LockIcons.findOne({
      where: { lock: lockAddress },
    })

    if (lockIcon) {
      if (lockIcon.icon.startsWith('data:')) {
        const parsedDataUri = parseDataUri(lockIcon.icon)
        return {
          icon: parsedDataUri.data,
          type: parsedDataUri.mimeType,
          isURL: false,
        }
      } else {
        return {
          icon: lockIcon.icon,
          type: null,
          isURL: true,
        }
      }
    } else {
      return getOriginal()
    }
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
  })
  if (lockIcon.isURL) {
    return res.redirect(lockIcon.icon)
  } else {
    console.log(lockIcon)
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
    // If we don't have a keyId or a tokenURI, we can try to get the image from the lock metadata
    const lockMetadata = await LockMetadata.findOne({
      where: {
        address: lockAddress,
        chain: network,
      },
    })

    const lockImage = lockMetadata?.data?.image
    // If we don't have a lock image, we throw an error and fall back to the default or stored icon
    if (!lockImage) {
      throw new Error('No image found')
    }
    const lockImageURL = new URL(lockImage)
    const lockImageURLPath = lockImageURL.pathname
    const isSelfRedirect =
      lockImageURLPath === request.path &&
      lockImageURL.host === new URL(config.services.locksmith).host

    // If we are redirecting to the same endpoint, we throw an error and fall back to the default or stored icon
    if (isSelfRedirect) {
      throw new Error('Redirect loop detected')
    }

    return response.redirect(lockImageURL.toString())
  } catch (error) {
    logger.error(error)
    const fallback = await getLockIcon({
      lockAddress,
    })
    if (fallback.isURL) {
      return response.redirect(fallback.icon)
    } else {
      response.setHeader('Content-Type', fallback.type)
      return response.send(fallback.icon)
    }
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
