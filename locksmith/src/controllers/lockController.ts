import parseDataUri from 'parse-data-uri'
import stripeOperations from '../operations/stripeOperations'
import { evaluateLockOwnership } from './metadataController'
import * as Normalizer from '../utils/normalizer'
import { LockIcons } from '../models'
import { Request, Response } from 'express'
import logger from '../logger'
import lockIconUtils from '../utils/lockIcon'

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

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
export const lockIcon = async (req: Request, res: Response) => {
  const { lockAddress } = req.params
  const { original } = req.query
  let lockIcon

  const renderDefaultForLock = () => {
    const svg = lockIconUtils.lockIcon(lockAddress)
    res.setHeader('Content-Type', 'image/svg+xml')
    return res.send(svg)
  }

  try {
    if (original !== '1') {
      lockIcon = await LockIcons.findOne({
        where: { lock: Normalizer.ethereumAddress(lockAddress) },
      })
    }

    if (lockIcon) {
      if (lockIcon.icon.startsWith('data:')) {
        const parsedDataUri = parseDataUri(lockIcon.icon)
        res.setHeader('Content-Type', parsedDataUri.mimeType)
        return res.send(parsedDataUri.data)
      } else {
        // This is just a regular URL redirect
        return res.redirect(lockIcon.icon)
      }
    } else {
      return renderDefaultForLock()
    }
  } catch (e) {
    logger.error(`Could not serve icon for ${lockAddress}`, e)
    return renderDefaultForLock()
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
  connectStripe,
  stripeConnected,
  changeLockIcon,
  disconnectStripe,
}

export default lockController
