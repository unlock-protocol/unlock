import { logger } from 'express-winston'
import stripeOperations from '../operations/stripeOperations'
import LockOwnership from '../data/lockOwnership'
import { evaluateLockOwnership } from './metadataController'

const lockOperations = require('../operations/lockOperations')
const lockIconUtils = require('../utils/lockIcon').default
const { getBaseTokenData } = require('../operations/metadataOperations')

const { getLockByAddress, getLocksByOwner, createLock } = lockOperations

const lockSave = async (req, res) => {
  const { lock } = req.body.message

  const databaseLock = await getLockByAddress(lock.address)

  // If the lock does not exist
  if (!databaseLock) {
    lock.chain = req.chain
    await createLock(lock)
    return res.sendStatus(200)
  }
}

const lockGet = async (req, res) => {
  // Serve lock metadata!
  const baseTokenData = await getBaseTokenData(
    req.params.lockAddress,
    `${req.protocol}://${req.headers.host}`
  )

  res.json(baseTokenData)
}

const lockOwnerGet = async (req, res) => {
  const locks = await getLocksByOwner(req.params.owner)
  return res.json({ locks })
}

const lockOwnershipCheck = async (req, res) => {
  const { lockAddress } = req.params
  LockOwnership.update([lockAddress], req.chain)
  return res.sendStatus(200)
}

const connectStripe = async (req, res) => {
  try {
    const { message } = JSON.parse(decodeURIComponent(req.query.data))
    // A previous middleware will have evaluated everything and assign a signee
    const { lockAddress, chain, baseUrl } = message['Connect Stripe']

    const isAuthorized = await evaluateLockOwnership(
      lockAddress,
      req.signee,
      chain
    )
    if (!isAuthorized) {
      res.sendStatus(401)
    } else {
      const links = await stripeOperations.connectStripe(
        req.signee,
        lockAddress,
        chain,
        baseUrl
      )
      return res.json(links)
    }
  } catch (error) {
    logger.error('There was an error', error)
    res.sendStatus(401)
  }
}

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
const lockIcon = async (req, res) => {
  const { lockAddress } = req.params
  const svg = lockIconUtils.lockIcon(lockAddress)
  res.setHeader('Content-Type', 'image/svg+xml')
  return res.send(svg)
}

module.exports = {
  lockGet,
  lockOwnerGet,
  lockSave,
  lockOwnershipCheck,
  lockIcon,
  connectStripe,
}
